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

    let nodes: any[] = [];
    let hasNextPage = false;
    let currentCursor = pagination.cursor;

    if (filters.slaState) {
      // Loop to fetch until we satisfy the limit
      while (nodes.length <= limit) {
        const batchLimit = limit * 2;
        const batch = await this.prisma.ticket.findMany({
          where,
          take: batchLimit + 1,
          ...(currentCursor ? { cursor: { id: currentCursor }, skip: 1 } : {}),
          orderBy: { createdAt: 'desc' },
          include: { reporter: true, assignee: true },
        });

        const batchHasNext = batch.length > batchLimit;
        const actualBatch = batchHasNext ? batch.slice(0, batchLimit) : batch;

        if (actualBatch.length === 0) break;

        for (const ticket of actualBatch) {
          const sla = this.slaService.computeSLA({
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            firstResponseAt: ticket.firstResponseAt,
            resolvedAt: ticket.resolvedAt,
          });
          
          if (sla.firstResponseState === filters.slaState || sla.resolutionState === filters.slaState) {
            nodes.push(ticket);
            if (nodes.length > limit) {
              hasNextPage = true;
              break;
            }
          }
        }

        if (nodes.length > limit) break;
        if (!batchHasNext) break;
        
        currentCursor = actualBatch[actualBatch.length - 1].id;
      }
      
      if (hasNextPage) {
        nodes.pop(); // Remove the extra node used for peek
      }
    } else {
      const tickets = await this.prisma.ticket.findMany({
        where,
        take: limit + 1,
        ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        include: { reporter: true, assignee: true },
      });

      hasNextPage = tickets.length > limit;
      nodes = hasNextPage ? tickets.slice(0, limit) : tickets;
    }

    const totalCount = await this.prisma.ticket.count({ where });

    return {
      nodes,
      pageInfo: {
        hasNextPage,
        endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : null,
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
