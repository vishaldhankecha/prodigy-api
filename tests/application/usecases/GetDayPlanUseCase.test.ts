import { GetDayPlanUseCase } from '../../../src/application/usecases/GetDayPlanUseCase';
import type { ActivityProgressRepository } from '../../../src/domain/repositories/ActivityProgressRepository';
import type { DayPlanRepository } from '../../../src/domain/repositories/DayPlanRepository';
import type { ProgramEnrollmentRepository } from '../../../src/domain/repositories/ProgramEnrollmentRepository';

describe('GetDayPlanUseCase', () => {
  it('returns day schedule with occurrence-based completion percentage', async () => {
    const dayPlanRepository: DayPlanRepository = {
      getByProgramAndDay: jest.fn().mockResolvedValue({
        id: 1,
        programId: 1,
        dayNumber: 2,
        title: 'Day 2 Plan',
        activities: [
          {
            id: 201,
            dayPlanId: 1,
            activityId: 11,
            plannedOccurrences: 3,
            sortOrder: 1,
            activity: {
              id: 11,
              title: 'Advanced Mobility Exercises',
              category: 'Athleticism',
              frequency: 'MAXIMIZE',
              timeMode: 'MAX',
              suggestedDurationSec: 300,
              defaultOccurrences: 3,
              sortOrder: 1,
            },
          },
          {
            id: 202,
            dayPlanId: 1,
            activityId: 12,
            plannedOccurrences: 1,
            sortOrder: 2,
            activity: {
              id: 12,
              title: 'Visual Solfege',
              category: 'Music',
              frequency: 'DAILY_1X',
              timeMode: 'SEC_30',
              suggestedDurationSec: 30,
              defaultOccurrences: 1,
              sortOrder: 2,
            },
          },
        ],
      }),
      getByProgramAndDayRange: jest.fn(),
    };

    const activityProgressRepository: ActivityProgressRepository = {
      getByUserAndScheduledActivityIds: jest.fn().mockResolvedValue([
        { dayPlanActivityId: 201, userId: 7, occurrenceNumber: 1, completedAt: new Date() },
        { dayPlanActivityId: 201, userId: 7, occurrenceNumber: 2, completedAt: new Date() },
      ]),
      createCompletion: jest.fn(),
      countCompletions: jest.fn(),
    };

    const programEnrollmentRepository: ProgramEnrollmentRepository = {
      isUserEnrolledInProgram: jest.fn().mockResolvedValue(true),
    };

    const useCase = new GetDayPlanUseCase(dayPlanRepository, activityProgressRepository, programEnrollmentRepository);

    const result = await useCase.execute({
      programId: 1,
      day: 2,
      userId: 7,
    });

    expect(result.completionPercentage).toBe(50);
    expect(result.activities).toEqual([
      {
        id: 201,
        activityId: 11,
        title: 'Advanced Mobility Exercises',
        category: 'Athleticism',
        frequency: 'MAXIMIZE',
        timeMode: 'MAX',
        suggestedDurationSec: 300,
        plannedOccurrences: 3,
        completedOccurrences: 2,
        completed: false,
      },
      {
        id: 202,
        activityId: 12,
        title: 'Visual Solfege',
        category: 'Music',
        frequency: 'DAILY_1X',
        timeMode: 'SEC_30',
        suggestedDurationSec: 30,
        plannedOccurrences: 1,
        completedOccurrences: 0,
        completed: false,
      },
    ]);
  });
});
