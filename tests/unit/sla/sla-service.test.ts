import { expect, test, describe } from 'bun:test';
import { SLAService } from '../../../apps/server/src/services/sla/sla.service';

describe('SLA Service', () => {
  const config = { timezone: 'UTC', startHour: 9, endHour: 18 };
  const getHolidays = () => [];
  const slaService = new SLAService(config, getHolidays);

  test('URGENT first response deadline', () => {
    const createdAt = new Date('2024-01-08T09:00:00Z');
    const sla = slaService.computeSLA({ priority: 'URGENT', createdAt, firstResponseAt: null, resolvedAt: null }, createdAt);
    
    expect(sla.firstResponseDueAt.toISOString()).toBe('2024-01-08T10:00:00.000Z');
    expect(sla.firstResponseState).toBe('ON_TRACK');
  });

  test('AT_RISK state', () => {
    const createdAt = new Date('2024-01-08T09:00:00Z');
    const now = new Date('2024-01-08T09:46:00Z'); // 46 mins elapsed out of 60 (> 75%)
    const sla = slaService.computeSLA({ priority: 'URGENT', createdAt, firstResponseAt: null, resolvedAt: null }, now);
    
    expect(sla.firstResponseState).toBe('AT_RISK');
  });

  test('BREACHED state', () => {
    const createdAt = new Date('2024-01-08T09:00:00Z');
    const now = new Date('2024-01-08T10:30:00Z'); // Passed 60 min limit
    const sla = slaService.computeSLA({ priority: 'URGENT', createdAt, firstResponseAt: null, resolvedAt: null }, now);
    
    expect(sla.firstResponseState).toBe('BREACHED');
  });

  test('Frozen state when resolved', () => {
    const createdAt = new Date('2024-01-08T09:00:00Z');
    const resolvedAt = new Date('2024-01-08T09:30:00Z');
    const now = new Date('2024-01-10T10:30:00Z'); // Way past deadline, but resolved earlier
    const sla = slaService.computeSLA({ priority: 'URGENT', createdAt, firstResponseAt: null, resolvedAt }, now);
    
    expect(sla.resolutionState).toBe('ON_TRACK');
  });
});
