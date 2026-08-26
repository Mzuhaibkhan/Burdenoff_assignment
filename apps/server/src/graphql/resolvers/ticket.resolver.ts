import { Resolvers } from '../../generated/graphql';
import { requireAuth, assertAuthorized } from '../../auth/permissions';

export const ticketResolvers: Resolvers = {
  Query: {
    tickets: async (_, { status, priority, assigneeId, slaState, take, cursor }, ctx) => {
      requireAuth(ctx.user);
      return ctx.services.ticket.listTickets(
        { 
          status: status as any, 
          priority: priority as any, 
          assigneeId: assigneeId ?? undefined, 
          slaState: slaState as any 
        },
        { take: take ?? undefined, cursor: cursor ?? undefined }
      ) as any;
    },
    ticket: async (_, { id }, ctx) => {
      requireAuth(ctx.user);
      return ctx.services.ticket.getTicket(id) as any;
    },
  },
  Mutation: {
    createTicket: async (_, { input }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'CREATE_TICKET');
      return ctx.services.ticket.createTicket(input, user.userId) as any;
    },
    assignTicket: async (_, { ticketId, assigneeId }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'ASSIGN_TICKET');
      return ctx.services.ticket.assignTicket(ticketId, assigneeId) as any;
    },
    changeTicketStatus: async (_, { ticketId, status }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'CHANGE_STATUS');
      return ctx.services.ticket.changeStatus(ticketId, status as any) as any;
    },
    resolveTicket: async (_, { ticketId }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'RESOLVE_TICKET');
      return ctx.services.ticket.resolveTicket(ticketId) as any;
    },
  },
};
