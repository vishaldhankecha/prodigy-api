import type { Progress } from '../../domain/entities/Progress';
import type { ActivityProgressRepository } from '../../domain/repositories/ActivityProgressRepository';
import { getPrisma } from '../database/prisma';

export class PrismaActivityProgressRepository implements ActivityProgressRepository {
  async getByUserAndScheduledActivityIds(userId: number, dayPlanActivityIds: number[]): Promise<Progress[]> {
    const prisma = getPrisma();
    if (dayPlanActivityIds.length === 0) {
      return [];
    }

    const results = await prisma.activityProgress.findMany({
      where: {
        userId,
        dayPlanActivityId: { in: dayPlanActivityIds },
      },
    });

    return results.map((progress) => ({
      dayPlanActivityId: progress.dayPlanActivityId,
      userId: progress.userId,
      occurrenceNumber: progress.occurrenceNumber,
      completedAt: progress.completedAt,
    }));
  }

  async createCompletion(userId: number, dayPlanActivityId: number, occurrenceNumber: number): Promise<Progress> {
    const prisma = getPrisma();
    const result = await prisma.activityProgress.create({
      data: {
        userId,
        dayPlanActivityId,
        occurrenceNumber,
      },
    });

    return {
      dayPlanActivityId: result.dayPlanActivityId,
      userId: result.userId,
      occurrenceNumber: result.occurrenceNumber,
      completedAt: result.completedAt,
    };
  }

  async countCompletions(userId: number, dayPlanActivityId: number): Promise<number> {
    const prisma = getPrisma();
    return prisma.activityProgress.count({
      where: {
        userId,
        dayPlanActivityId,
      },
    });
  }
}
