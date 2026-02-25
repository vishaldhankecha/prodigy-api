import { Prisma } from '@prisma/client';
import type { Progress } from '../../domain/entities/Progress';
import type { ActivityProgressRepository, CompletionResult } from '../../domain/repositories/ActivityProgressRepository';
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

  async completeNextOccurrence(
    userId: number,
    dayPlanActivityId: number,
    plannedOccurrences: number,
  ): Promise<CompletionResult | null> {
    const prisma = getPrisma();

    try {
      return await prisma.$transaction(async (tx) => {
        // Lock the schedule row so concurrent completion attempts serialize.
        await tx.$queryRawUnsafe('SELECT id FROM `DayPlanActivity` WHERE id = ? FOR UPDATE', dayPlanActivityId);

        const completedOccurrences = await tx.activityProgress.count({
          where: {
            userId,
            dayPlanActivityId,
          },
        });

        if (completedOccurrences >= plannedOccurrences) {
          return null;
        }

        const nextOccurrence = completedOccurrences + 1;
        const created = await tx.activityProgress.create({
          data: {
            userId,
            dayPlanActivityId,
            occurrenceNumber: nextOccurrence,
          },
        });

        return {
          progress: {
            dayPlanActivityId: created.dayPlanActivityId,
            userId: created.userId,
            occurrenceNumber: created.occurrenceNumber,
            completedAt: created.completedAt,
          },
          completedOccurrences: nextOccurrence,
        };
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return null;
      }
      throw error;
    }
  }
}
