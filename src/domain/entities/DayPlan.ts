import type { Activity } from './Activity';

export interface DayScheduledActivity {
  id: number;
  dayPlanId: number;
  activityId: number;
  plannedOccurrences: number;
  sortOrder: number;
  activity: Activity;
}

export interface DayPlan {
  id: number;
  programId: number;
  dayNumber: number;
  title: string;
  activities: DayScheduledActivity[];
}
