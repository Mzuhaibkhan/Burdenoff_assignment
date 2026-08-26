import type { PrismaClient, UserRole } from '@prisma/client';
import { verifyToken } from './auth/jwt';
import { prisma } from './db/client';
import { createLoaders, type Loaders } from './loaders/data-loaders';
import { AuthService } from './services/auth/auth.service';
import { TicketService } from './services/ticket/ticket.service';
import { CommentService } from './services/comment/comment.service';
import { SLAService } from './services/sla/sla.service';
import { HolidayService } from './services/holiday/holiday.service';
import { UserService } from './services/user/user.service';
import { env } from './env';

export interface GraphQLContext {
  prisma: PrismaClient;
  user: { userId: string; role: UserRole } | null;
  loaders: Loaders;
  services: {
    auth: AuthService;
    ticket: TicketService;
    comment: CommentService;
    sla: SLAService;
    holiday: HolidayService;
    user: UserService;
  };
}

// Services are singletons — created once, shared across all requests
const holidayService = new HolidayService(prisma);
const slaService = new SLAService(
  {
    timezone: env.BUSINESS_TIMEZONE,
    startHour: env.BUSINESS_HOUR_START,
    endHour: env.BUSINESS_HOUR_END,
  },
  () => holidayService.getHolidayDates(),
);
const authService = new AuthService(prisma);
const ticketService = new TicketService(prisma, slaService);
const commentService = new CommentService(prisma);
const userService = new UserService(prisma);

export async function createContext(request: Request): Promise<GraphQLContext> {
  // Extract JWT from Authorization header
  let user: GraphQLContext['user'] = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      user = { userId: payload.userId, role: payload.role as UserRole };
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }

  return {
    prisma,
    user,
    loaders: createLoaders(prisma),  // Fresh DataLoader per request (required)
    services: {
      auth: authService,
      ticket: ticketService,
      comment: commentService,
      sla: slaService,
      holiday: holidayService,
      user: userService,
    },
  };
}
