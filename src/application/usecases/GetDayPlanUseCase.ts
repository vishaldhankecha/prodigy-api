import { ForbiddenError, NotFoundError } from '../errors/AppError';
import type { ActivityProgressRepository } from '../../domain/repositories/ActivityProgressRepository';
import type { DayPlanRepository } from '../../domain/repositories/DayPlanRepository';
import type { ProgramEnrollmentRepository } from '../../domain/repositories/ProgramEnrollmentRepository';

interface Input {
  programId: number;
  day: number;
  userId: number;
}

interface OutputActivity {
  id: number;
  activityId: number;
  title: string;
  category: string;
  frequency: string;
  timeMode: string;
  suggestedDurationSec: number;
  plannedOccurrences: number;
  completedOccurrences: number;
  completed: boolean;
}

export interface GetDayPlanOutput {
  programId: number;
  day: number;
  title: string;
  activities: OutputActivity[];
  completionPercentage: number;
}

export class GetDayPlanUseCase {
  constructor(
    private readonly dayPlanRepository: DayPlanRepository,
    private readonly activityProgressRepository: ActivityProgressRepository,
    private readonly programEnrollmentRepository: ProgramEnrollmentRepository,
  ) {}

  async execute(input: Input): Promise<GetDayPlanOutput> {
    const isEnrolled = await this.programEnrollmentRepository.isUserEnrolledInProgram(input.userId, input.programId);
    if (!isEnrolled) {
      throw new ForbiddenError('User is not enrolled in this program');
    }

    const dayPlan = await this.dayPlanRepository.getByProgramAndDay(input.programId, input.day);

    if (!dayPlan) {
      throw new NotFoundError('Day plan not found');
    }

    const dayPlanActivityIds = dayPlan.activities.map((activity) => activity.id);
    const progresses = await this.activityProgressRepository.getByUserAndScheduledActivityIds(input.userId, dayPlanActivityIds);

    const completedCountByDayActivity = new Map<number, number>();
    for (const progress of progresses) {
      const current = completedCountByDayActivity.get(progress.dayPlanActivityId) ?? 0;
      completedCountByDayActivity.set(progress.dayPlanActivityId, current + 1);
    }

    const activities = dayPlan.activities.map((activity) => {
      const completedOccurrences = completedCountByDayActivity.get(activity.id) ?? 0;
      return {
        id: activity.id,
        activityId: activity.activityId,
        title: activity.activity.title,
        category: activity.activity.category,
        frequency: activity.activity.frequency,
        timeMode: activity.activity.timeMode,
        suggestedDurationSec: activity.activity.suggestedDurationSec,
        plannedOccurrences: activity.plannedOccurrences,
        completedOccurrences,
        completed: completedOccurrences >= activity.plannedOccurrences,
      };
    });

    const totalPlanned = activities.reduce((sum, activity) => sum + activity.plannedOccurrences, 0);
    const totalCompleted = activities.reduce((sum, activity) => sum + Math.min(activity.completedOccurrences, activity.plannedOccurrences), 0);

    const completionPercentage = totalPlanned === 0 ? 0 : Math.round((totalCompleted / totalPlanned) * 100);

    return {
      programId: dayPlan.programId,
      day: dayPlan.dayNumber,
      title: dayPlan.title,
      activities,
      completionPercentage,
    };
  }
}
