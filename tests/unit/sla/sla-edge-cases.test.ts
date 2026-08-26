import { expect, test, describe } from 'bun:test';
import { addBusinessMinutes } from '../../../apps/server/src/services/sla/business-hours';

describe('SLA Edge Cases', () => {
  const config = { timezone: 'UTC', startHour: 9, endHour: 18 };

  test('Consecutive holidays', () => {
    const getHolidays = () => [new Date('2024-01-08T00:00:00Z'), new Date('2024-01-09T00:00:00Z')]; // Mon, Tue
    // Created Fri 17:00, add 2h -> should land on Wed 10:00
    const result = addBusinessMinutes(new Date('2024-01-05T17:00:00Z'), 120, config, getHolidays());
    expect(result.toISOString()).toBe('2024-01-10T10:00:00.000Z');
  });

  test('Holiday on weekend', () => {
    const getHolidays = () => [new Date('2024-01-06T00:00:00Z')]; // Sat
    // Created Fri 17:00, add 2h -> should land on Mon 10:00 (Sat holiday has no effect)
    const result = addBusinessMinutes(new Date('2024-01-05T17:00:00Z'), 120, config, getHolidays());
    expect(result.toISOString()).toBe('2024-01-08T10:00:00.000Z');
  });

  test('Ticket created on holiday', () => {
    const getHolidays = () => [new Date('2024-01-08T00:00:00Z')]; // Mon
    // Created Mon 12:00, add 2h -> starts Wed 11:00 (since Tue is next biz day)
    // Wait, Mon 12:00 is a holiday, so the 2h starts from Tue 09:00 -> Tue 11:00
    const result = addBusinessMinutes(new Date('2024-01-08T12:00:00Z'), 120, config, getHolidays());
    expect(result.toISOString()).toBe('2024-01-09T11:00:00.000Z');
  });
});
