import { Resolvers } from '../../generated/graphql';
import { requireAuth, assertAuthorized } from '../../auth/permissions';

export const commentResolvers: Resolvers = {
  Mutation: {
    addComment: async (_, { ticketId, content }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'ADD_COMMENT');
      return ctx.services.comment.addComment(ticketId, content, user.userId) as any;
    },
  },
};
