import { MarkActivityCompleteUseCase } from '../../../src/application/usecases/MarkActivityCompleteUseCase';
import type { ActivityProgressRepository } from '../../../src/domain/repositories/ActivityProgressRepository';
import type { ActivityRepository } from '../../../src/domain/repositories/ActivityRepository';
import type { ProgramEnrollmentRepository } from '../../../src/domain/repositories/ProgramEnrollmentRepository';

describe('MarkActivityCompleteUseCase', () => {
  it('creates next completion occurrence for scheduled activity', async () => {
    const activityRepository: ActivityRepository = {
      getScheduledById: jest.fn().mockResolvedValue({
        id: 44,
        plannedOccurrences: 3,
        programId: 1,
      }),
    };

    const completedAt = new Date();

    const activityProgressRepository: ActivityProgressRepository = {
      getByUserAndScheduledActivityIds: jest.fn(),
      completeNextOccurrence: jest.fn().mockResolvedValue({
        completedOccurrences: 2,
        progress: {
          dayPlanActivityId: 44,
          userId: 99,
          occurrenceNumber: 2,
          completedAt,
        },
      }),
    };

    const programEnrollmentRepository: ProgramEnrollmentRepository = {
      isUserEnrolledInProgram: jest.fn().mockResolvedValue(true),
    };

    const useCase = new MarkActivityCompleteUseCase(
      activityRepository,
      activityProgressRepository,
      programEnrollmentRepository,
    );

    const result = await useCase.execute({
      dayPlanActivityId: 44,
      userId: 99,
    });

    expect(result).toEqual({
      dayPlanActivityId: 44,
      userId: 99,
      completedOccurrence: 2,
      completedOccurrences: 2,
      plannedOccurrences: 3,
      completed: false,
      completedAt,
    });
  });
});
