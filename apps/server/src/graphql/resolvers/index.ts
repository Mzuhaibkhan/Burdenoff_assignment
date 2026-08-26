import { DateTimeResolver } from 'graphql-scalars';
import { authResolvers } from './auth.resolver';
import { ticketResolvers } from './ticket.resolver';
import { slaResolvers } from './sla.resolver';
import { commentResolvers } from './comment.resolver';
import { holidayResolvers } from './holiday.resolver';
import { dashboardResolvers } from './dashboard.resolver';
import { userResolvers } from './user.resolver';

export const resolvers = [
  { DateTime: DateTimeResolver },
  { Query: { _empty: () => "empty" }, Mutation: { _empty: () => "empty" } },
  authResolvers,
  ticketResolvers,
  slaResolvers,
  commentResolvers,
  holidayResolvers,
  dashboardResolvers,
  userResolvers,
];
