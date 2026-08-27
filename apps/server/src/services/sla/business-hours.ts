import type { BusinessHoursConfig } from './types';

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

// Helper: Get local date components in a specific timezone
function getLocalParts(date: Date, tz: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  
  const p = {} as Record<string, string>;
  for (const part of parts) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }
  
  return {
    year: parseInt(p.year, 10),
    month: parseInt(p.month, 10),
    day: parseInt(p.day, 10),
    hour: parseInt(p.hour, 10) % 24, // 24 becomes 0
    minute: parseInt(p.minute, 10),
    dayOfWeek: p.weekday, // 'Sat', 'Sun', etc.
  };
}

// Helper: Set local time in timezone and return UTC date
function setLocalTime(date: Date, tz: string, hour: number, minute: number): Date {
  const localDateStr = formatInTimeZone(date, tz, 'yyyy-MM-dd');
  const targetStr = `${localDateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  return fromZonedTime(targetStr, tz);
}

export function isWeekend(date: Date, tz: string): boolean {
  const parts = getLocalParts(date, tz);
  return parts.dayOfWeek === 'Sat' || parts.dayOfWeek === 'Sun';
}

export function isHoliday(date: Date, holidays: Date[], tz: string): boolean {
  const parts = getLocalParts(date, tz);
  return holidays.some(h => {
    // holidays are provided as Date objects mapped from PostgreSQL Date fields (which are UTC midnight)
    const hYear = h.getUTCFullYear();
    const hMonth = h.getUTCMonth() + 1;
    const hDay = h.getUTCDate();
    return parts.year === hYear && parts.month === hMonth && parts.day === hDay;
  });
}

export function isBusinessDay(date: Date, tz: string, holidays: Date[]): boolean {
  return !isWeekend(date, tz) && !isHoliday(date, holidays, tz);
}

export function isBusinessTime(date: Date, config: BusinessHoursConfig, holidays: Date[]): boolean {
  if (!isBusinessDay(date, config.timezone, holidays)) return false;
  const parts = getLocalParts(date, config.timezone);
  const timeInMinutes = parts.hour * 60 + parts.minute;
  const startInMinutes = config.startHour * 60;
  const endInMinutes = config.endHour * 60;
  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
}

export function getNextBusinessStart(date: Date, config: BusinessHoursConfig, holidays: Date[]): Date {
  let current = new Date(date.getTime());
  
  // if it's already a business time, return as is
  if (isBusinessTime(current, config, holidays)) {
    return current;
  }
  
  // If it's before start time on a business day, jump to start time
  if (isBusinessDay(current, config.timezone, holidays)) {
    const parts = getLocalParts(current, config.timezone);
    if (parts.hour < config.startHour) {
      return setLocalTime(current, config.timezone, config.startHour, 0);
    }
  }
  
  // Otherwise, jump to next day(s) until we hit a business day
  while (true) {
    // add 24 hours to step forward
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    if (isBusinessDay(current, config.timezone, holidays)) {
      return setLocalTime(current, config.timezone, config.startHour, 0);
    }
  }
}

export function addBusinessMinutes(start: Date, minutes: number, config: BusinessHoursConfig, holidays: Date[]): Date {
  let current = getNextBusinessStart(start, config, holidays);
  let remaining = minutes;
  
  while (remaining > 0) {
    const endOfDay = setLocalTime(current, config.timezone, config.endHour, 0);
    const minutesLeftToday = Math.floor((endOfDay.getTime() - current.getTime()) / 60000);
    
    if (remaining <= minutesLeftToday) {
      return new Date(current.getTime() + remaining * 60000);
    } else {
      remaining -= minutesLeftToday;
      // Advance to next day
      const nextDay = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      current = getNextBusinessStart(setLocalTime(nextDay, config.timezone, 0, 0), config, holidays);
    }
  }
  
  return current;
}

export function getElapsedBusinessMinutes(start: Date, end: Date, config: BusinessHoursConfig, holidays: Date[]): number {
  if (start.getTime() >= end.getTime()) return 0;
  
  let current = getNextBusinessStart(start, config, holidays);
  let total = 0;
  
  while (current.getTime() < end.getTime()) {
    if (!isBusinessDay(current, config.timezone, holidays)) {
      const nextDay = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      current = getNextBusinessStart(setLocalTime(nextDay, config.timezone, 0, 0), config, holidays);
      continue;
    }
    
    const dayStart = new Date(Math.max(current.getTime(), setLocalTime(current, config.timezone, config.startHour, 0).getTime()));
    const dayEnd = new Date(Math.min(end.getTime(), setLocalTime(current, config.timezone, config.endHour, 0).getTime()));
    
    if (dayStart.getTime() < dayEnd.getTime()) {
      total += Math.floor((dayEnd.getTime() - dayStart.getTime()) / 60000);
    }
    
    const nextDay = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    current = getNextBusinessStart(setLocalTime(nextDay, config.timezone, 0, 0), config, holidays);
  }
  
  return total;
}

export function getRemainingBusinessMinutes(now: Date, deadline: Date, config: BusinessHoursConfig, holidays: Date[]): number {
  return getElapsedBusinessMinutes(now, deadline, config, holidays);
}
