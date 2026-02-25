export type ActivityFrequency = 'MAXIMIZE' | 'DAILY_1X' | 'DAILY_2X' | 'DAILY_3X' | 'WEEKLY_2X' | 'WEEKLY_3X';

export type ActivityTimeMode = 'MAX' | 'SEC_30' | 'SEC_60' | 'SEC_90' | 'SEC_120';

export interface Activity {
  id: number;
  title: string;
  category: string;
  frequency: ActivityFrequency;
  timeMode: ActivityTimeMode;
  suggestedDurationSec: number;
  defaultOccurrences: number;
  sortOrder: number;
}
