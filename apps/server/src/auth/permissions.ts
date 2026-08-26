import type { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../errors/graphql-errors';

type Action =
  | 'CREATE_TICKET'
  | 'ASSIGN_TICKET'
  | 'CHANGE_STATUS'
  | 'RESOLVE_TICKET'
  | 'ADD_COMMENT'
  | 'VIEW_TICKETS'
  | 'MANAGE_HOLIDAYS';

const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  REPORTER: ['CREATE_TICKET', 'ADD_COMMENT', 'VIEW_TICKETS'],
  AGENT: [
    'CREATE_TICKET', 'ASSIGN_TICKET', 'CHANGE_STATUS',
    'RESOLVE_TICKET', 'ADD_COMMENT', 'VIEW_TICKETS', 'MANAGE_HOLIDAYS',
  ],
};

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

export function requireAuth(user: AuthenticatedUser | null): AuthenticatedUser {
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export function assertAuthorized(role: UserRole, action: Action): void {
  if (!ROLE_PERMISSIONS[role]?.includes(action)) {
    throw new ForbiddenError(`Role ${role} cannot perform ${action}`);
  }
}
