import { Resolvers } from '../../generated/graphql';

export const authResolvers: Resolvers = {
  Mutation: {
    register: async (_, { input }, ctx) => {
      return ctx.services.auth.register(input);
    },
    login: async (_, { input }, ctx) => {
      return ctx.services.auth.login(input);
    },
  },
};
