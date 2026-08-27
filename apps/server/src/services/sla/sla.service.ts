import { SLA_POLICIES } from '@shared/types';
import { addBusinessMinutes, getElapsedBusinessMinutes, getRemainingBusinessMinutes } from './business-hours';
import type { BusinessHoursConfig, SLAComputeInput, SLAResult } from './types';

export class SLAService {
  constructor(
    private config: BusinessHoursConfig,
    private getHolidayDates: () => Date[],  // Injected function for lazy holiday loading
  ) {}

  computeSLA(input: SLAComputeInput, now: Date = new Date()): SLAResult {
    const holidays = this.getHolidayDates();
    const policy = SLA_POLICIES[input.priority as keyof typeof SLA_POLICIES];

    const localConfig = {
      ...this.config,
      timezone: input.timezone || this.config.timezone,
    };

    // 1. Compute deadlines
    const firstResponseDueAt = addBusinessMinutes(
      input.createdAt, policy.firstResponseMinutes, localConfig, holidays
    );
    const resolutionDueAt = addBusinessMinutes(
      input.createdAt, policy.resolutionMinutes, localConfig, holidays
    );

    // 2. Compute first-response SLA state
    const firstResponseResult = this.computeSLAState(
      input.createdAt,
      input.firstResponseAt,
      firstResponseDueAt,
      policy.firstResponseMinutes,
      now,
      holidays,
      localConfig
    );

    // 3. Compute resolution SLA state
    const resolutionResult = this.computeSLAState(
      input.createdAt,
      input.resolvedAt,
      resolutionDueAt,
      policy.resolutionMinutes,
      now,
      holidays,
      localConfig
    );

    return {
      firstResponseDueAt,
      resolutionDueAt,
      firstResponseState: firstResponseResult.state,
      resolutionState: resolutionResult.state,
      firstResponseRemainingMinutes: firstResponseResult.remainingMinutes,
      resolutionRemainingMinutes: resolutionResult.remainingMinutes,
      firstResponseBreached: firstResponseResult.state === 'BREACHED',
      resolutionBreached: resolutionResult.state === 'BREACHED',
    };
  }

  private computeSLAState(
    createdAt: Date,
    frozenAt: Date | null,    // firstResponseAt or resolvedAt
    dueAt: Date,
    budgetMinutes: number,
    now: Date,
    holidays: Date[],
    config: BusinessHoursConfig,
  ): { state: 'ON_TRACK' | 'AT_RISK' | 'BREACHED'; remainingMinutes: number } {
    if (frozenAt) {
      // Clock frozen — compare elapsed at freeze time vs budget
      const elapsed = getElapsedBusinessMinutes(createdAt, frozenAt, config, holidays);
      const percentage = elapsed / budgetMinutes;

      let state: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
      if (percentage >= 1) {
        state = 'BREACHED';
      } else if (percentage >= 0.75) {
        state = 'AT_RISK';
      } else {
        state = 'ON_TRACK';
      }

      return {
        state,
        remainingMinutes: Math.max(0, budgetMinutes - elapsed),
      };
    }

    // Clock still running
    const elapsed = getElapsedBusinessMinutes(createdAt, now, config, holidays);
    const percentage = elapsed / budgetMinutes;
    const remaining = getRemainingBusinessMinutes(now, dueAt, config, holidays);

    let state: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
    if (percentage >= 1) {
      state = 'BREACHED';
    } else if (percentage >= 0.75) {
      state = 'AT_RISK';
    } else {
      state = 'ON_TRACK';
    }

    return { state, remainingMinutes: remaining };
  }
}
