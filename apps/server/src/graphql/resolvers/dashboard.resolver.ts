import { Resolvers, TicketStatus } from '../../generated/graphql';
import { requireAuth } from '../../auth/permissions';
import { TicketStatus as PrismaTicketStatus } from '@prisma/client';

export const dashboardResolvers: Resolvers = {
  Query: {
    dashboard: async (_, __, ctx) => {
      requireAuth(ctx.user);
      
      const counts = await ctx.prisma.ticket.groupBy({
        by: ['status'],
        _count: true,
      });

      let openTickets = 0;
      let inProgressTickets = 0;
      let resolvedTickets = 0;
      let closedTickets = 0;
      let totalTickets = 0;

      for (const group of counts) {
        totalTickets += group._count;
        if (group.status === PrismaTicketStatus.OPEN) openTickets = group._count;
        if (group.status === PrismaTicketStatus.IN_PROGRESS) inProgressTickets = group._count;
        if (group.status === PrismaTicketStatus.RESOLVED) resolvedTickets = group._count;
        if (group.status === PrismaTicketStatus.CLOSED) closedTickets = group._count;
      }

      // Compute SLA for atRisk and breached
      const activeTickets = await ctx.prisma.ticket.findMany({
        where: {
          status: { notIn: [PrismaTicketStatus.RESOLVED, PrismaTicketStatus.CLOSED] }
        }
      });

      let atRiskTickets = 0;
      let breachedTickets = 0;

      for (const ticket of activeTickets) {
        const sla = ctx.services.sla.computeSLA({
          priority: ticket.priority,
          createdAt: ticket.createdAt,
          firstResponseAt: ticket.firstResponseAt,
          resolvedAt: ticket.resolvedAt,
        });
        
        if (sla.firstResponseState === 'BREACHED' || sla.resolutionState === 'BREACHED') {
          breachedTickets++;
        } else if (sla.firstResponseState === 'AT_RISK' || sla.resolutionState === 'AT_RISK') {
          atRiskTickets++;
        }
      }

      return {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        atRiskTickets,
        breachedTickets,
      };
    },
    users: async (_, { role }, ctx) => {
      requireAuth(ctx.user);
      return ctx.services.user.listUsers(role as any) as any;
    },
  },
};
