import type { Progress } from '../entities/Progress';

export interface CompletionResult {
  progress: Progress;
  completedOccurrences: number;
}

export interface ActivityProgressRepository {
  getByUserAndScheduledActivityIds(userId: number, dayPlanActivityIds: number[]): Promise<Progress[]>;
  completeNextOccurrence(userId: number, dayPlanActivityId: number, plannedOccurrences: number): Promise<CompletionResult | null>;
}
