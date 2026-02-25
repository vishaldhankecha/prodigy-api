import type { Progress } from '../entities/Progress';

export interface ActivityProgressRepository {
  getByUserAndScheduledActivityIds(userId: number, dayPlanActivityIds: number[]): Promise<Progress[]>;
  createCompletion(userId: number, dayPlanActivityId: number, occurrenceNumber: number): Promise<Progress>;
  countCompletions(userId: number, dayPlanActivityId: number): Promise<number>;
}
