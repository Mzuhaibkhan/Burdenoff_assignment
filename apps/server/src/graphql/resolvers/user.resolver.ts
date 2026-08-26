import { Resolvers } from '../../generated/graphql';

export const userResolvers: Resolvers = {
  Ticket: {
    reporter: async (parent, _, ctx) => {
      return ctx.loaders.userLoader.load(parent.reporterId) as any;
    },
    assignee: async (parent, _, ctx) => {
      if (!parent.assigneeId) return null;
      return ctx.loaders.userLoader.load(parent.assigneeId) as any;
    },
  },
  Comment: {
    author: async (parent, _, ctx) => {
      return ctx.loaders.userLoader.load(parent.authorId) as any;
    },
  },
};
