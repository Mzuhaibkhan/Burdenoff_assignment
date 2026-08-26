import { Resolvers } from '../../generated/graphql';

export const userResolvers: Resolvers = {
  Ticket: {
    reporter: async (parent, _, ctx) => {
      const user = await ctx.loaders.userLoader.load(parent.reporterId);
      if (user instanceof Error) throw user;
      return user;
    },
    assignee: async (parent, _, ctx) => {
      if (!parent.assigneeId) return null;
      const user = await ctx.loaders.userLoader.load(parent.assigneeId);
      if (user instanceof Error) throw user;
      return user;
    },
  },
  Comment: {
    author: async (parent, _, ctx) => {
      const user = await ctx.loaders.userLoader.load(parent.authorId);
      if (user instanceof Error) throw user;
      return user;
    },
  },
};
