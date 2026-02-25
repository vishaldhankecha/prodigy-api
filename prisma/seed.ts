import { spawnSync } from 'node:child_process';

type Frequency = 'MAXIMIZE' | 'DAILY_1X' | 'DAILY_2X' | 'DAILY_3X' | 'WEEKLY_2X' | 'WEEKLY_3X';
type TimeMode = 'MAX' | 'SEC_30' | 'SEC_60' | 'SEC_90' | 'SEC_120';
type RuleType = 'DAILY' | 'WEEKLY';

interface SchedulingRule {
  ruleType: RuleType;
  occurrencesPerDay: number;
  weeklyDays: number[];
}

interface ActivityTemplate {
  title: string;
  category: string;
  frequency: Frequency;
  timeMode: TimeMode;
  suggestedDurationSec: number;
  defaultOccurrences: number;
  sortOrder: number;
  scheduleRule: SchedulingRule;
}

const activityTemplates: ActivityTemplate[] = [
  {
    title: 'Advanced Mobility Exercises',
    category: 'Athleticism',
    frequency: 'MAXIMIZE',
    timeMode: 'MAX',
    suggestedDurationSec: 300,
    defaultOccurrences: 3,
    sortOrder: 1,
    scheduleRule: { ruleType: 'DAILY', occurrencesPerDay: 3, weeklyDays: [] },
  },
  {
    title: 'Knowledge Boosters (Follow daily plans)',
    category: 'Boosters',
    frequency: 'DAILY_2X',
    timeMode: 'SEC_30',
    suggestedDurationSec: 30,
    defaultOccurrences: 2,
    sortOrder: 2,
    scheduleRule: { ruleType: 'DAILY', occurrencesPerDay: 2, weeklyDays: [] },
  },
  {
    title: 'Visual Solfege',
    category: 'Music',
    frequency: 'DAILY_1X',
    timeMode: 'SEC_30',
    suggestedDurationSec: 30,
    defaultOccurrences: 1,
    sortOrder: 3,
    scheduleRule: { ruleType: 'DAILY', occurrencesPerDay: 1, weeklyDays: [] },
  },
  {
    title: 'Auditory Memory (Song 2)',
    category: 'Memory',
    frequency: 'DAILY_1X',
    timeMode: 'SEC_30',
    suggestedDurationSec: 30,
    defaultOccurrences: 1,
    sortOrder: 4,
    scheduleRule: { ruleType: 'DAILY', occurrencesPerDay: 1, weeklyDays: [] },
  },
  {
    title: 'Auditory Magic (Set 2)',
    category: 'Creativity',
    frequency: 'DAILY_2X',
    timeMode: 'SEC_60',
    suggestedDurationSec: 60,
    defaultOccurrences: 2,
    sortOrder: 5,
    scheduleRule: { ruleType: 'DAILY', occurrencesPerDay: 2, weeklyDays: [] },
  },
  {
    title: 'Talk, To Listen',
    category: 'Languages',
    frequency: 'DAILY_1X',
    timeMode: 'SEC_60',
    suggestedDurationSec: 60,
    defaultOccurrences: 1,
    sortOrder: 6,
    scheduleRule: { ruleType: 'DAILY', occurrencesPerDay: 1, weeklyDays: [] },
  },
  {
    title: 'Finger Skills',
    category: 'Athleticism',
    frequency: 'WEEKLY_3X',
    timeMode: 'SEC_60',
    suggestedDurationSec: 60,
    defaultOccurrences: 1,
    sortOrder: 7,
    scheduleRule: { ruleType: 'WEEKLY', occurrencesPerDay: 1, weeklyDays: [3, 6, 7] },
  },
  {
    title: 'Stimulus Explosion',
    category: 'Creativity',
    frequency: 'WEEKLY_2X',
    timeMode: 'SEC_60',
    suggestedDurationSec: 60,
    defaultOccurrences: 1,
    sortOrder: 8,
    scheduleRule: { ruleType: 'WEEKLY', occurrencesPerDay: 1, weeklyDays: [2, 5] },
  },
  {
    title: 'Foundations of Logic',
    category: 'Logic',
    frequency: 'WEEKLY_2X',
    timeMode: 'SEC_60',
    suggestedDurationSec: 60,
    defaultOccurrences: 1,
    sortOrder: 9,
    scheduleRule: { ruleType: 'WEEKLY', occurrencesPerDay: 1, weeklyDays: [1, 4] },
  },
];

const plannedOccurrencesForDay = (dayNumber: number, rule: SchedulingRule): number => {
  const dayInWeek = ((dayNumber - 1) % 7) + 1;

  if (rule.ruleType === 'DAILY') {
    return rule.occurrencesPerDay;
  }

  return rule.weeklyDays.includes(dayInWeek) ? rule.occurrencesPerDay : 0;
};

const quote = (value: string): string => `'${value.replace(/'/g, "''")}'`;

const sqlParts: string[] = [
  'SET FOREIGN_KEY_CHECKS = 0;',
  'DELETE FROM `ActivityProgress`;',
  'DELETE FROM `ProgramEnrollment`;',
  'DELETE FROM `DayPlanActivity`;',
  'DELETE FROM `ActivityScheduleRule`;',
  'DELETE FROM `DayPlan`;',
  'DELETE FROM `Activity`;',
  'DELETE FROM `User`;',
  'DELETE FROM `Program`;',
  'SET FOREIGN_KEY_CHECKS = 1;',
  "INSERT INTO `Program` (`id`, `name`, `description`, `totalDays`, `createdAt`, `updatedAt`) VALUES (1, '30-Day Wellness Program', 'A month-long plan with rule-driven activity scheduling.', 30, NOW(), NOW());",
  "INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`) VALUES (1, 'test.user@prodigy.local', 'Test User', NOW(), NOW());",
  "INSERT INTO `ProgramEnrollment` (`userId`, `programId`, `status`, `startDate`, `createdAt`, `updatedAt`) VALUES (1, 1, 'ACTIVE', NOW(), NOW(), NOW());",
];

for (const template of activityTemplates) {
  sqlParts.push(
    `INSERT INTO \`Activity\` (\`programId\`, \`title\`, \`category\`, \`frequency\`, \`timeMode\`, \`suggestedDurationSec\`, \`defaultOccurrences\`, \`sortOrder\`, \`createdAt\`, \`updatedAt\`) VALUES (1, ${quote(template.title)}, ${quote(template.category)}, ${quote(template.frequency)}, ${quote(template.timeMode)}, ${template.suggestedDurationSec}, ${template.defaultOccurrences}, ${template.sortOrder}, NOW(), NOW());`,
  );

  const weeklyDaysCsv = template.scheduleRule.weeklyDays.join(',');
  sqlParts.push(
    `INSERT INTO \`ActivityScheduleRule\` (\`activityId\`, \`ruleType\`, \`occurrencesPerDay\`, \`weeklyDaysCsv\`, \`createdAt\`, \`updatedAt\`) VALUES ((SELECT id FROM \`Activity\` WHERE \`programId\` = 1 AND \`sortOrder\` = ${template.sortOrder}), ${quote(template.scheduleRule.ruleType)}, ${template.scheduleRule.occurrencesPerDay}, ${weeklyDaysCsv ? quote(weeklyDaysCsv) : 'NULL'}, NOW(), NOW());`,
  );
}

for (let day = 1; day <= 30; day += 1) {
  sqlParts.push(
    `INSERT INTO \`DayPlan\` (\`programId\`, \`dayNumber\`, \`title\`, \`createdAt\`, \`updatedAt\`) VALUES (1, ${day}, 'Day ${day} Plan', NOW(), NOW());`,
  );

  for (const template of activityTemplates) {
    const plannedOccurrences = plannedOccurrencesForDay(day, template.scheduleRule);
    if (plannedOccurrences === 0) {
      continue;
    }

    sqlParts.push(
      `INSERT INTO \`DayPlanActivity\` (\`dayPlanId\`, \`activityId\`, \`plannedOccurrences\`, \`sortOrder\`, \`createdAt\`, \`updatedAt\`) VALUES ((SELECT id FROM \`DayPlan\` WHERE \`programId\` = 1 AND \`dayNumber\` = ${day}), (SELECT id FROM \`Activity\` WHERE \`programId\` = 1 AND \`sortOrder\` = ${template.sortOrder}), ${plannedOccurrences}, ${template.sortOrder}, NOW(), NOW());`,
    );
  }
}

const sql = sqlParts.join('\n');

const result = spawnSync('npx', ['prisma', 'db', 'execute', '--stdin'], {
  input: sql,
  encoding: 'utf-8',
  stdio: 'pipe',
});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

process.stdout.write('Seed completed successfully.\n');
