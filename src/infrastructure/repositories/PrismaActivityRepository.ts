import type { ActivityRepository, ScheduledActivityRef } from '../../domain/repositories/ActivityRepository';
import { getPrisma } from '../database/prisma';

export class PrismaActivityRepository implements ActivityRepository {
  async getScheduledById(dayPlanActivityId: number): Promise<ScheduledActivityRef | null> {
    const prisma = getPrisma();
    const schedule = await prisma.dayPlanActivity.findFirst({
      where: {
        id: dayPlanActivityId,
        isActive: true,
      },
      select: {
        id: true,
        plannedOccurrences: true,
        dayPlan: {
          select: {
            programId: true,
          },
        },
      },
    });

    if (!schedule) {
      return null;
    }

    return {
      id: schedule.id,
      plannedOccurrences: schedule.plannedOccurrences,
      programId: schedule.dayPlan.programId,
    };
  }
}
