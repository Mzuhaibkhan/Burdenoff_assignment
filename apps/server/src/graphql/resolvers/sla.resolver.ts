import { Resolvers } from '../../generated/graphql';

export const slaResolvers: Resolvers = {
  Ticket: {
    sla: (parent, _, ctx) => {
      const slaResult = ctx.services.sla.computeSLA({
        priority: parent.priority,
        createdAt: parent.createdAt,
        firstResponseAt: parent.firstResponseAt,
        resolvedAt: parent.resolvedAt,
      });
      return {
        firstResponseDueAt: slaResult.firstResponseDueAt.toISOString(),
        resolutionDueAt: slaResult.resolutionDueAt.toISOString(),
        firstResponseState: slaResult.firstResponseState as any,
        resolutionState: slaResult.resolutionState as any,
        firstResponseRemainingMinutes: slaResult.firstResponseRemainingMinutes,
        resolutionRemainingMinutes: slaResult.resolutionRemainingMinutes,
        firstResponseBreached: slaResult.firstResponseBreached,
        resolutionBreached: slaResult.resolutionBreached,
      };
    },
  },
};
