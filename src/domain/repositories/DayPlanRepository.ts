import type { DayPlan } from '../entities/DayPlan';

export interface DayPlanRepository {
  getByProgramAndDay(programId: number, day: number): Promise<DayPlan | null>;
  getByProgramAndDayRange(programId: number, startDay: number, endDay: number): Promise<DayPlan[]>;
}
