import { expect, test, describe } from 'bun:test';
import { addBusinessMinutes, getElapsedBusinessMinutes, getRemainingBusinessMinutes, isBusinessTime } from '../../../apps/server/src/services/sla/business-hours';

describe('Business Hours Engine', () => {
  const config = { timezone: 'UTC', startHour: 9, endHour: 18 };
  const getHolidays = () => [new Date('2024-12-25T00:00:00Z')];

  test('isBusinessTime', () => {
    expect(isBusinessTime(new Date('2024-01-10T10:00:00Z'), config, getHolidays())).toBe(true);
    expect(isBusinessTime(new Date('2024-01-13T10:00:00Z'), config, getHolidays())).toBe(false);
    expect(isBusinessTime(new Date('2024-01-10T20:00:00Z'), config, getHolidays())).toBe(false);
    expect(isBusinessTime(new Date('2024-12-25T10:00:00Z'), config, getHolidays())).toBe(false);
  });

  test('addBusinessMinutes', () => {
    const d1 = addBusinessMinutes(new Date('2024-01-08T10:00:00Z'), 240, config, getHolidays());
    expect(d1.toISOString()).toBe('2024-01-08T14:00:00.000Z');

    const d2 = addBusinessMinutes(new Date('2024-01-08T07:00:00Z'), 60, config, getHolidays());
    expect(d2.toISOString()).toBe('2024-01-08T10:00:00.000Z');

    const d3 = addBusinessMinutes(new Date('2024-01-12T17:00:00Z'), 120, config, getHolidays());
    expect(d3.toISOString()).toBe('2024-01-15T10:00:00.000Z');
  });

  test('getElapsedBusinessMinutes', () => {
    expect(getElapsedBusinessMinutes(new Date('2024-01-08T10:00:00Z'), new Date('2024-01-08T14:00:00Z'), config, getHolidays())).toBe(240);
    expect(getElapsedBusinessMinutes(new Date('2024-01-12T17:00:00Z'), new Date('2024-01-15T10:00:00Z'), config, getHolidays())).toBe(120);
  });

  test('getRemainingBusinessMinutes', () => {
    const deadline = new Date('2024-01-08T14:00:00Z');
    expect(getRemainingBusinessMinutes(new Date('2024-01-08T10:00:00Z'), deadline, config, getHolidays())).toBe(240);
    expect(getRemainingBusinessMinutes(new Date('2024-01-08T15:00:00Z'), deadline, config, getHolidays())).toBe(0); // past deadline
  });
});
