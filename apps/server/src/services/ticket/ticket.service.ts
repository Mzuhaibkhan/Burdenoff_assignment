import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { createTicketSchema } from '../../validation/ticket.validation';
import { NotFoundError, ForbiddenError, InvalidTransitionError } from '../../errors/graphql-errors';
import { VALID_TRANSITIONS, TicketStatus, Priority, SLAState } from '@shared/types';
import { SLAService } from '../sla/sla.service';

export class TicketService {
  constructor(private prisma: PrismaClient, private slaService: SLAService) {}

  async createTicket(input: z.infer<typeof createTicketSchema>, reporterId: string) {
    const data = createTicketSchema.parse(input);
    return this.prisma.ticket.create({
      data: {
        ...data,
        status: TicketStatus.OPEN,
        reporterId,
      }
    });
  }

  async getTicket(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        reporter: true,
        assignee: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } }
      }
    });
    if (!ticket) throw new NotFoundError('Ticket', id);
    return ticket;
  }

  async listTickets(
    filters: { status?: TicketStatus; priority?: Priority; assigneeId?: string; slaState?: SLAState },
    pagination: { take?: number; cursor?: string }
  ) {
    const limit = Math.min(pagination.take ?? 20, 50);

    const where: Prisma.TicketWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    const tickets = await this.prisma.ticket.findMany({
      where,
      take: limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { reporter: true, assignee: true },
    });

    const hasNextPage = tickets.length > limit;
    const nodes = hasNextPage ? tickets.slice(0, limit) : tickets;

    let filteredNodes = nodes;
    if (filters.slaState) {
      filteredNodes = nodes.filter((ticket) => {
        const sla = this.slaService.computeSLA({
          priority: ticket.priority,
          createdAt: ticket.createdAt,
          firstResponseAt: ticket.firstResponseAt,
          resolvedAt: ticket.resolvedAt,
        });
        return sla.firstResponseState === filters.slaState
            || sla.resolutionState === filters.slaState;
      });
    }

    const totalCount = await this.prisma.ticket.count({ where });

    return {
      nodes: filteredNodes,
      pageInfo: {
        hasNextPage,
        endCursor: filteredNodes.length > 0 ? filteredNodes[filteredNodes.length - 1].id : null,
      },
      totalCount,
    };
  }

  async assignTicket(ticketId: string, assigneeId: string) {
    const assignee = await this.prisma.user.findUnique({ where: { id: assigneeId } });
    if (!assignee) throw new NotFoundError('User', assigneeId);
    if (assignee.role !== 'AGENT') throw new ForbiddenError('Only AGENTS can be assigned to tickets');
    
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assigneeId }
    });
  }

  async changeStatus(ticketId: string, newStatus: TicketStatus) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('Ticket', ticketId);
    
    const allowed = VALID_TRANSITIONS[ticket.status as TicketStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new InvalidTransitionError(ticket.status, newStatus);
    }
    
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus }
    });
  }

  async resolveTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError('Ticket', ticketId);
    
    const allowed = VALID_TRANSITIONS[ticket.status as TicketStatus] || [];
    if (!allowed.includes(TicketStatus.RESOLVED)) {
      throw new InvalidTransitionError(ticket.status, TicketStatus.RESOLVED);
    }
    
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        resolvedAt: new Date()
      }
    });
  }
}
