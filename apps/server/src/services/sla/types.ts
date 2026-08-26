export interface BusinessHoursConfig {
  timezone: string;          // e.g., 'Asia/Kolkata'
  startHour: number;         // e.g., 9 (9:00 AM)
  endHour: number;           // e.g., 18 (6:00 PM)
}

export interface SLAPolicy {
  firstResponseMinutes: number;
  resolutionMinutes: number;
}

export interface SLAComputeInput {
  priority: string;          // Priority enum value
  createdAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
}

export interface SLAResult {
  firstResponseDueAt: Date;
  resolutionDueAt: Date;
  firstResponseState: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  resolutionState: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  firstResponseRemainingMinutes: number;
  resolutionRemainingMinutes: number;
  firstResponseBreached: boolean;
  resolutionBreached: boolean;
}
