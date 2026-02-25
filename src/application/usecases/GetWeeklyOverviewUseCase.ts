import { ForbiddenError } from '../errors/AppError';
import type { ActivityProgressRepository } from '../../domain/repositories/ActivityProgressRepository';
import type { DayPlanRepository } from '../../domain/repositories/DayPlanRepository';
import type { ProgramEnrollmentRepository } from '../../domain/repositories/ProgramEnrollmentRepository';

interface Input {
  programId: number;
  weekNumber: number;
  userId: number;
}

interface DailyOverview {
  day: number;
  completionPercentage: number;
  activitiesPlanned: number;
  plannedOccurrences: number;
  completedOccurrences: number;
}

export interface GetWeeklyOverviewOutput {
  programId: number;
  weekNumber: number;
  days: DailyOverview[];
}

export class GetWeeklyOverviewUseCase {
  constructor(
    private readonly dayPlanRepository: DayPlanRepository,
    private readonly activityProgressRepository: ActivityProgressRepository,
    private readonly programEnrollmentRepository: ProgramEnrollmentRepository,
  ) {}

  async execute(input: Input): Promise<GetWeeklyOverviewOutput> {
    const isEnrolled = await this.programEnrollmentRepository.isUserEnrolledInProgram(input.userId, input.programId);
    if (!isEnrolled) {
      throw new ForbiddenError('User is not enrolled in this program');
    }

    const startDay = (input.weekNumber - 1) * 7 + 1;
    const endDay = startDay + 6;

    const dayPlans = await this.dayPlanRepository.getByProgramAndDayRange(input.programId, startDay, endDay);
    const dayPlanActivityIds = dayPlans.flatMap((dayPlan) => dayPlan.activities.map((activity) => activity.id));
    const progresses = await this.activityProgressRepository.getByUserAndScheduledActivityIds(input.userId, dayPlanActivityIds);

    const completedCountByDayActivity = new Map<number, number>();
    for (const progress of progresses) {
      const current = completedCountByDayActivity.get(progress.dayPlanActivityId) ?? 0;
      completedCountByDayActivity.set(progress.dayPlanActivityId, current + 1);
    }

    const days = dayPlans
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map((dayPlan) => {
        const activitiesPlanned = dayPlan.activities.length;
        const plannedOccurrences = dayPlan.activities.reduce((sum, activity) => sum + activity.plannedOccurrences, 0);
        const completedOccurrences = dayPlan.activities.reduce((sum, activity) => {
          const completed = completedCountByDayActivity.get(activity.id) ?? 0;
          return sum + Math.min(completed, activity.plannedOccurrences);
        }, 0);

        const completionPercentage =
          plannedOccurrences === 0 ? 0 : Math.round((completedOccurrences / plannedOccurrences) * 100);

        return {
          day: dayPlan.dayNumber,
          completionPercentage,
          activitiesPlanned,
          plannedOccurrences,
          completedOccurrences,
        };
      });

    return {
      programId: input.programId,
      weekNumber: input.weekNumber,
      days,
    };
  }
}
