export interface ScheduledActivityRef {
  id: number;
  plannedOccurrences: number;
  programId: number;
}

export interface ActivityRepository {
  getScheduledById(dayPlanActivityId: number): Promise<ScheduledActivityRef | null>;
}
