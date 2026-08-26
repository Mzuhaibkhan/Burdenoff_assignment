// Mirrors Prisma enums — used by both frontend and backend
export enum UserRole {
  REPORTER = 'REPORTER',
  AGENT = 'AGENT',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum SLAState {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  BREACHED = 'BREACHED',
}
