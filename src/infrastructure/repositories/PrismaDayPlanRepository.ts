import type { DayPlan } from '../../domain/entities/DayPlan';
import type { DayPlanRepository } from '../../domain/repositories/DayPlanRepository';
import { getPrisma } from '../database/prisma';

const mapDayPlan = (result: {
  id: number;
  programId: number;
  dayNumber: number;
  title: string;
  activities: Array<{
    id: number;
    dayPlanId: number;
    activityId: number;
    plannedOccurrences: number;
    sortOrder: number;
    activity: {
      id: number;
      title: string;
      category: string;
      frequency: string;
      timeMode: string;
      suggestedDurationSec: number;
      defaultOccurrences: number;
      sortOrder: number;
    };
  }>;
}): DayPlan => ({
  id: result.id,
  programId: result.programId,
  dayNumber: result.dayNumber,
  title: result.title,
  activities: result.activities.map((schedule) => ({
    id: schedule.id,
    dayPlanId: schedule.dayPlanId,
    activityId: schedule.activityId,
    plannedOccurrences: schedule.plannedOccurrences,
    sortOrder: schedule.sortOrder,
    activity: {
      id: schedule.activity.id,
      title: schedule.activity.title,
      category: schedule.activity.category,
      frequency: schedule.activity.frequency as
        | 'MAXIMIZE'
        | 'DAILY_1X'
        | 'DAILY_2X'
        | 'DAILY_3X'
        | 'WEEKLY_2X'
        | 'WEEKLY_3X',
      timeMode: schedule.activity.timeMode as 'MAX' | 'SEC_30' | 'SEC_60' | 'SEC_90' | 'SEC_120',
      suggestedDurationSec: schedule.activity.suggestedDurationSec,
      defaultOccurrences: schedule.activity.defaultOccurrences,
      sortOrder: schedule.activity.sortOrder,
    },
  })),
});

export class PrismaDayPlanRepository implements DayPlanRepository {
  async getByProgramAndDay(programId: number, day: number): Promise<DayPlan | null> {
    const prisma = getPrisma();
    const result = await prisma.dayPlan.findUnique({
      where: {
        programId_dayNumber: {
          programId,
          dayNumber: day,
        },
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!result) {
      return null;
    }

    return mapDayPlan(result);
  }

  async getByProgramAndDayRange(programId: number, startDay: number, endDay: number): Promise<DayPlan[]> {
    const prisma = getPrisma();
    const results = await prisma.dayPlan.findMany({
      where: {
        programId,
        dayNumber: { gte: startDay, lte: endDay },
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { dayNumber: 'asc' },
    });

    return results.map(mapDayPlan);
  }
}
