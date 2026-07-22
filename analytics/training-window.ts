export const DEFAULT_BUILD_WEEKS = 12;
export const LEAD_IN_WEEKS = 2;
export const PRE_RACE_WINDOW_WEEKS = DEFAULT_BUILD_WEEKS + LEAD_IN_WEEKS;

export type TrainingActivity = {
  date: string;
  miles: number;
};

export type TrainingWindowSummary = {
  start: string;
  endExclusive: string;
  totalMiles: number;
  averageMilesPerWeek: number;
  activityCount: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseUtcDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO date: ${date}`);
  }
  return parsed;
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getPreRaceWindow(
  raceDate: string,
  weeks = PRE_RACE_WINDOW_WEEKS,
): { start: string; endExclusive: string } {
  if (!Number.isInteger(weeks) || weeks <= 0) {
    throw new Error("Training-window weeks must be a positive integer.");
  }

  const race = parseUtcDate(raceDate);
  const start = new Date(race.getTime() - weeks * 7 * DAY_MS);

  return {
    start: formatUtcDate(start),
    endExclusive: formatUtcDate(race),
  };
}

export function summarizePreRaceTraining(
  activities: TrainingActivity[],
  raceDate: string,
  weeks = PRE_RACE_WINDOW_WEEKS,
): TrainingWindowSummary {
  const window = getPreRaceWindow(raceDate, weeks);
  const start = parseUtcDate(window.start).getTime();
  const end = parseUtcDate(window.endExclusive).getTime();

  const included = activities.filter((activity) => {
    const activityDate = parseUtcDate(activity.date).getTime();
    return activityDate >= start && activityDate < end;
  });

  const totalMiles = included.reduce((sum, activity) => sum + activity.miles, 0);

  return {
    ...window,
    totalMiles: Number(totalMiles.toFixed(2)),
    averageMilesPerWeek: Number((totalMiles / weeks).toFixed(2)),
    activityCount: included.length,
  };
}
