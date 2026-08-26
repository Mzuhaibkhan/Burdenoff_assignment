import { Resolvers } from '../../generated/graphql';
import { requireAuth, assertAuthorized } from '../../auth/permissions';
import { TicketStatus, Priority, SLAState } from '@shared/types';

export const ticketResolvers: Resolvers = {
  Query: {
    tickets: async (_, { status, priority, assigneeId, slaState, take, cursor }, ctx) => {
      requireAuth(ctx.user);
      return ctx.services.ticket.listTickets(
        { 
          status: status as unknown as TicketStatus | undefined, 
          priority: priority as unknown as Priority | undefined, 
          assigneeId: assigneeId ?? undefined, 
          slaState: slaState as unknown as SLAState | undefined 
        },
        { take: take ?? undefined, cursor: cursor ?? undefined }
      );
    },
    ticket: async (_, { id }, ctx) => {
      requireAuth(ctx.user);
      return ctx.services.ticket.getTicket(id);
    },
  },
  Mutation: {
    createTicket: async (_, { input }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'CREATE_TICKET');
      return ctx.services.ticket.createTicket(input as any, user.userId);
    },
    assignTicket: async (_, { ticketId, assigneeId }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'ASSIGN_TICKET');
      return ctx.services.ticket.assignTicket(ticketId, assigneeId);
    },
    changeTicketStatus: async (_, { ticketId, status }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'CHANGE_STATUS');
      return ctx.services.ticket.changeStatus(ticketId, status as unknown as TicketStatus);
    },
    resolveTicket: async (_, { ticketId }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'RESOLVE_TICKET');
      return ctx.services.ticket.resolveTicket(ticketId);
    },
  },
};
