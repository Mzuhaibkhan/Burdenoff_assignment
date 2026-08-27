import { Resolvers, SlaState } from '../../generated/graphql';
import { SLAState } from '@shared/types';

export const slaResolvers: Resolvers = {
  Ticket: {
    sla: (parent, _, ctx) => {
      const slaResult = ctx.services.sla.computeSLA({
        priority: parent.priority,
        createdAt: parent.createdAt,
        firstResponseAt: parent.firstResponseAt,
        resolvedAt: parent.resolvedAt,
        timezone: (parent as any).timezone,
      });
      return {
        firstResponseDueAt: slaResult.firstResponseDueAt.toISOString(),
        resolutionDueAt: slaResult.resolutionDueAt.toISOString(),
        firstResponseState: slaResult.firstResponseState as unknown as SlaState,
        resolutionState: slaResult.resolutionState as unknown as SlaState,
        firstResponseRemainingMinutes: slaResult.firstResponseRemainingMinutes,
        resolutionRemainingMinutes: slaResult.resolutionRemainingMinutes,
        firstResponseBreached: slaResult.firstResponseBreached,
        resolutionBreached: slaResult.resolutionBreached,
      };
    },
  },
};
