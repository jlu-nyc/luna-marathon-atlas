import {
  PRE_RACE_WINDOW_WEEKS,
  getPreRaceWindow,
} from "./training-window";

export type Activity = {
  date: string;
  name?: string;
  miles: number;
  avgHr?: number | null;
  paceSecPerMile?: number | null;
};

export type WeeklyTraining = {
  week: string;
  miles: number;
  runs: number;
  activeDays: number;
  longest: number;
};

export type NotableRun = {
  date: string;
  name: string;
  miles: number;
  pace: number | null;
};

export type TaperSummary = {
  peakWeekMiles: number;
  penultimateWeekMiles: number;
  raceWeekMiles: number;
  penultimateReductionPercent: number | null;
  raceWeekReductionPercent: number | null;
};

/**
 * Compatible with the existing Cycle JSON contract, with taper details added.
 */
export type TrainingCycle = {
  start: string;
  raceDate: string;
  weeks: number;
  totalMiles: number;
  avgWeek: number;
  peakWeek: number;
  runs: number;
  activeDays: number;
  runs10: number;
  runs12: number;
  runs14: number;
  runs18: number;
  runs20: number;
  longest: number;
  weekly: WeeklyTraining[];
  notable: NotableRun[];
  taper: TaperSummary;
};

export type TrainingCycleOptions = {
  weeks?: number;
  notableRunLimit?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseUtcDate(value: string): Date {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${value}`);
  }
  return date;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function reductionPercent(reference: number, comparison: number): number | null {
  if (reference <= 0) return null;
  return round(((reference - comparison) / reference) * 100, 1);
}

function countAtLeast(activities: Activity[], miles: number): number {
  return activities.filter((activity) => activity.miles >= miles).length;
}

function createWeeklyBuckets(start: string, weeks: number): WeeklyTraining[] {
  const startDate = parseUtcDate(start);
  return Array.from({ length: weeks }, (_, index) => ({
    week: formatUtcDate(new Date(startDate.getTime() + index * 7 * DAY_MS)),
    miles: 0,
    runs: 0,
    activeDays: 0,
    longest: 0,
  }));
}

function aggregateWeeks(
  activities: Activity[],
  start: string,
  weeks: number,
): WeeklyTraining[] {
  const startTime = parseUtcDate(start).getTime();
  const buckets = createWeeklyBuckets(start, weeks);
  const activeDates = buckets.map(() => new Set<string>());

  for (const activity of activities) {
    const activityTime = parseUtcDate(activity.date).getTime();
    const weekIndex = Math.floor((activityTime - startTime) / (7 * DAY_MS));
    if (weekIndex < 0 || weekIndex >= weeks) continue;

    const bucket = buckets[weekIndex];
    bucket.miles += activity.miles;
    bucket.runs += 1;
    bucket.longest = Math.max(bucket.longest, activity.miles);
    activeDates[weekIndex].add(activity.date);
  }

  return buckets.map((bucket, index) => ({
    ...bucket,
    miles: round(bucket.miles, 1),
    activeDays: activeDates[index].size,
    longest: round(bucket.longest, 2),
  }));
}

export function buildTrainingCycle(
  activities: Activity[],
  raceDate: string,
  options: TrainingCycleOptions = {},
): TrainingCycle {
  const weeks = options.weeks ?? PRE_RACE_WINDOW_WEEKS;
  const notableRunLimit = options.notableRunLimit ?? 8;

  if (!Number.isInteger(notableRunLimit) || notableRunLimit < 0) {
    throw new Error("Notable-run limit must be a non-negative integer.");
  }

  const window = getPreRaceWindow(raceDate, weeks);
  const startTime = parseUtcDate(window.start).getTime();
  const raceTime = parseUtcDate(raceDate).getTime();

  const included = activities
    .filter((activity) => {
      if (!Number.isFinite(activity.miles) || activity.miles < 0) {
        throw new Error(`Invalid mileage for activity on ${activity.date}.`);
      }
      const activityTime = parseUtcDate(activity.date).getTime();
      return activityTime >= startTime && activityTime < raceTime;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const weekly = aggregateWeeks(included, window.start, weeks);
  const totalMiles = included.reduce((sum, activity) => sum + activity.miles, 0);
  const longest = included.reduce(
    (maximum, activity) => Math.max(maximum, activity.miles),
    0,
  );
  const peakWeek = weekly.reduce(
    (maximum, week) => Math.max(maximum, week.miles),
    0,
  );

  const peakWeekIndex = weekly.findIndex((week) => week.miles === peakWeek);
  const penultimateWeek = weekly.at(-2)?.miles ?? 0;
  const raceWeek = weekly.at(-1)?.miles ?? 0;

  const notable = [...included]
    .sort((a, b) => b.miles - a.miles || a.date.localeCompare(b.date))
    .slice(0, notableRunLimit)
    .map((activity) => ({
      date: activity.date,
      name: activity.name?.trim() || "Run",
      miles: round(activity.miles, 2),
      pace:
        activity.paceSecPerMile == null
          ? null
          : round(activity.paceSecPerMile / 60, 2),
    }));

  return {
    start: window.start,
    raceDate,
    weeks,
    totalMiles: round(totalMiles, 1),
    avgWeek: round(totalMiles / weeks, 1),
    peakWeek: round(peakWeek, 1),
    runs: included.length,
    activeDays: new Set(included.map((activity) => activity.date)).size,
    runs10: countAtLeast(included, 10),
    runs12: countAtLeast(included, 12),
    runs14: countAtLeast(included, 14),
    runs18: countAtLeast(included, 18),
    runs20: countAtLeast(included, 20),
    longest: round(longest, 2),
    weekly,
    notable,
    taper: {
      peakWeekMiles: peakWeekIndex >= 0 ? weekly[peakWeekIndex].miles : 0,
      penultimateWeekMiles: penultimateWeek,
      raceWeekMiles: raceWeek,
      penultimateReductionPercent: reductionPercent(peakWeek, penultimateWeek),
      raceWeekReductionPercent: reductionPercent(peakWeek, raceWeek),
    },
  };
}
