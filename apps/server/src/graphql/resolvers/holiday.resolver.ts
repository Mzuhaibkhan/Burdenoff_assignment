import { Resolvers } from '../../generated/graphql';
import { requireAuth, assertAuthorized } from '../../auth/permissions';
import { Holiday } from '@prisma/client';

export const holidayResolvers: Resolvers = {
  Query: {
    holidays: async (_, __, ctx) => {
      requireAuth(ctx.user);
      const holidays = await ctx.services.holiday.getHolidays();
      return holidays.map((h: Holiday) => ({
        id: h.id,
        date: h.date,
        name: h.name,
      }));
    },
  },
  Mutation: {
    addHoliday: async (_, { date, name }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'MANAGE_HOLIDAYS');
      const holiday = await ctx.services.holiday.addHoliday(date, name);
      return {
        id: holiday.id,
        date: holiday.date,
        name: holiday.name,
      };
    },
    removeHoliday: async (_, { id }, ctx) => {
      const user = requireAuth(ctx.user);
      assertAuthorized(user.role, 'MANAGE_HOLIDAYS');
      return ctx.services.holiday.removeHoliday(id);
    },
  },
};
