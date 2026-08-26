import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export class HolidayService {
  private cachedDates: Date[] | null = null;

  constructor(private prisma: PrismaClient) {}

  async getHolidays() {
    return this.prisma.holiday.findMany({ orderBy: { date: 'asc' } });
  }

  getHolidayDates(): Date[] {
    if (!this.cachedDates) {
      this.refreshCache();
      return [];
    }
    return this.cachedDates;
  }

  async refreshCache() {
    const holidays = await this.prisma.holiday.findMany({ select: { date: true } });
    this.cachedDates = holidays.map(h => h.date);
  }

  async addHoliday(dateStr: string, name: string) {
    // Validate date format (simple YYYY-MM-DD or full ISO)
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) throw new Error("Invalid date");
    
    const holiday = await this.prisma.holiday.create({ data: { date, name } });
    this.invalidateCache();
    await this.refreshCache();
    return holiday;
  }

  async removeHoliday(id: string) {
    await this.prisma.holiday.delete({ where: { id } });
    this.invalidateCache();
    await this.refreshCache();
    return true;
  }

  private invalidateCache(): void {
    this.cachedDates = null;
  }
}
