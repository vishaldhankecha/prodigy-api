import 'dotenv/config';
import { getPrisma } from '../infrastructure/database/prisma';

interface ActivityWithRule {
  id: number;
  sortOrder: number;
  scheduleRule: {
    ruleType: 'DAILY' | 'WEEKLY';
    occurrencesPerDay: number;
    weeklyDaysCsv: string | null;
  } | null;
}

const parseProgramIdArg = (): number | null => {
  const arg = process.argv.find((value) => value.startsWith('--programId='));
  if (!arg) {
    return null;
  }

  const value = Number(arg.split('=')[1]);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('Invalid --programId. Expected a positive integer.');
  }

  return value;
};

const plannedOccurrencesForDay = (dayNumber: number, activity: ActivityWithRule): number => {
  const rule = activity.scheduleRule;
  if (!rule) {
    return 0;
  }

  if (rule.ruleType === 'DAILY') {
    return rule.occurrencesPerDay;
  }

  const dayInWeek = ((dayNumber - 1) % 7) + 1;
  const weeklyDays = (rule.weeklyDaysCsv ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7);

  return weeklyDays.includes(dayInWeek) ? rule.occurrencesPerDay : 0;
};

const regenerateProgramSchedule = async (programId: number): Promise<void> => {
  const prisma = getPrisma();

  const [dayPlans, activities] = await Promise.all([
    prisma.dayPlan.findMany({
      where: { programId },
      select: { id: true, dayNumber: true },
      orderBy: { dayNumber: 'asc' },
    }),
    prisma.activity.findMany({
      where: { programId },
      select: {
        id: true,
        sortOrder: true,
        scheduleRule: {
          select: {
            ruleType: true,
            occurrencesPerDay: true,
            weeklyDaysCsv: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  if (dayPlans.length === 0) {
    throw new Error(`No day plans found for programId=${programId}`);
  }

  await prisma.$transaction(async (tx) => {
    const desired = new Map<string, { dayPlanId: number; activityId: number; plannedOccurrences: number; sortOrder: number }>();
    for (const dayPlan of dayPlans) {
      for (const activity of activities) {
        const plannedOccurrences = plannedOccurrencesForDay(dayPlan.dayNumber, activity as ActivityWithRule);
        if (plannedOccurrences === 0) {
          continue;
        }

        desired.set(`${dayPlan.id}:${activity.id}`, {
          dayPlanId: dayPlan.id,
          activityId: activity.id,
          plannedOccurrences,
          sortOrder: activity.sortOrder,
        });
      }
    }

    const existing = await tx.dayPlanActivity.findMany({
      where: {
        dayPlan: {
          programId,
        },
      },
      select: {
        id: true,
        dayPlanId: true,
        activityId: true,
        _count: {
          select: { progresses: true },
        },
      },
    });

    for (const entry of desired.values()) {
      await tx.dayPlanActivity.upsert({
        where: {
          dayPlanId_activityId: {
            dayPlanId: entry.dayPlanId,
            activityId: entry.activityId,
          },
        },
        create: {
          dayPlanId: entry.dayPlanId,
          activityId: entry.activityId,
          plannedOccurrences: entry.plannedOccurrences,
          sortOrder: entry.sortOrder,
          isActive: true,
        },
        update: {
          plannedOccurrences: entry.plannedOccurrences,
          sortOrder: entry.sortOrder,
          isActive: true,
        },
      });
    }

    for (const row of existing) {
      const key = `${row.dayPlanId}:${row.activityId}`;
      if (desired.has(key)) {
        continue;
      }

      if (row._count.progresses > 0) {
        await tx.dayPlanActivity.update({
          where: { id: row.id },
          data: { isActive: false },
        });
      } else {
        await tx.dayPlanActivity.delete({
          where: { id: row.id },
        });
      }
    }
  });
};

const main = async (): Promise<void> => {
  const prisma = getPrisma();
  const programId = parseProgramIdArg();

  try {
    const programIds =
      programId === null
        ? (await prisma.program.findMany({ select: { id: true } })).map((program) => program.id)
        : [programId];

    for (const id of programIds) {
      await regenerateProgramSchedule(id);
      // eslint-disable-next-line no-console
      console.log(`Regenerated schedule for programId=${id}`);
    }
  } finally {
    await prisma.$disconnect();
  }
};

void main();
