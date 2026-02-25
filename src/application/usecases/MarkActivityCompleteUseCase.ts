import { ForbiddenError, NotFoundError, ValidationError } from '../errors/AppError';
import type { ActivityProgressRepository } from '../../domain/repositories/ActivityProgressRepository';
import type { ActivityRepository } from '../../domain/repositories/ActivityRepository';
import type { ProgramEnrollmentRepository } from '../../domain/repositories/ProgramEnrollmentRepository';

interface Input {
  dayPlanActivityId: number;
  userId: number;
}

export interface MarkActivityCompleteOutput {
  dayPlanActivityId: number;
  userId: number;
  completedOccurrence: number;
  completedOccurrences: number;
  plannedOccurrences: number;
  completed: boolean;
  completedAt: Date;
}

export class MarkActivityCompleteUseCase {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityProgressRepository: ActivityProgressRepository,
    private readonly programEnrollmentRepository: ProgramEnrollmentRepository,
  ) {}

  async execute(input: Input): Promise<MarkActivityCompleteOutput> {
    const scheduledActivity = await this.activityRepository.getScheduledById(input.dayPlanActivityId);
    if (!scheduledActivity) {
      throw new NotFoundError('Scheduled activity not found');
    }

    const isEnrolled = await this.programEnrollmentRepository.isUserEnrolledInProgram(
      input.userId,
      scheduledActivity.programId,
    );
    if (!isEnrolled) {
      throw new ForbiddenError('User is not enrolled in this program');
    }

    const completedOccurrences = await this.activityProgressRepository.countCompletions(input.userId, input.dayPlanActivityId);
    if (completedOccurrences >= scheduledActivity.plannedOccurrences) {
      throw new ValidationError('All planned occurrences are already completed for this activity');
    }

    const nextOccurrence = completedOccurrences + 1;
    const progress = await this.activityProgressRepository.createCompletion(
      input.userId,
      input.dayPlanActivityId,
      nextOccurrence,
    );

    return {
      dayPlanActivityId: progress.dayPlanActivityId,
      userId: progress.userId,
      completedOccurrence: progress.occurrenceNumber,
      completedOccurrences: nextOccurrence,
      plannedOccurrences: scheduledActivity.plannedOccurrences,
      completed: nextOccurrence >= scheduledActivity.plannedOccurrences,
      completedAt: progress.completedAt,
    };
  }
}
