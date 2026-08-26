import { Priority, TicketStatus } from './enums';

// SLA Policies: business-hours minutes
export const SLA_POLICIES: Record<Priority, { firstResponseMinutes: number; resolutionMinutes: number }> = {
  [Priority.URGENT]: { firstResponseMinutes: 60,   resolutionMinutes: 240   },  // 1h / 4h
  [Priority.HIGH]:   { firstResponseMinutes: 240,  resolutionMinutes: 1440  },  // 4h / 3 days
  [Priority.MEDIUM]: { firstResponseMinutes: 480,  resolutionMinutes: 2880  },  // 1 day / 5.3 days
  [Priority.LOW]:    { firstResponseMinutes: 1440, resolutionMinutes: 4320  },  // 2.7 days / 8 days
};

// Valid status transitions (from → allowed next statuses)
export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]:        [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.OPEN, TicketStatus.CLOSED],
  [TicketStatus.RESOLVED]:    [TicketStatus.CLOSED, TicketStatus.OPEN],
  [TicketStatus.CLOSED]:      [TicketStatus.OPEN],  // Reopen only
};
