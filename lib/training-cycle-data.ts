import { buildTrainingCycle, type Activity, type TrainingCycle } from "@/analytics/training-cycle";
import activitiesJson from "@/data/activities.json";
import type { Cycle, Marathon } from "@/lib/types";

const activities = activitiesJson as Activity[];

/**
 * Chicago 2024 is the first controlled migration from precomputed JSON
 * to the tested Training Cycle Engine.
 */
export const ENGINE_ENABLED_RACE_IDS = new Set(["chicago-2024"]);

export type CycleMetricDelta = {
  metric: string;
  generated: number;
  baseline: number;
  delta: number;
};

export type ResolvedTrainingCycle = {
  cycle: Cycle | TrainingCycle | null;
  source: "engine" | "baseline" | "unavailable";
  baseline: Cycle | null;
  deltas: CycleMetricDelta[];
};

const round = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export function compareCycles(
  generated: TrainingCycle,
  baseline: Cycle,
): CycleMetricDelta[] {
  const metrics: Array<[string, number, number]> = [
    ["Total miles", generated.totalMiles, baseline.totalMiles],
    ["Average/week", generated.avgWeek, baseline.avgWeek],
    ["Peak week", generated.peakWeek, baseline.peakWeek],
    ["Runs", generated.runs, baseline.runs],
    ["Active days", generated.activeDays, baseline.activeDays],
    ["10+ mile runs", generated.runs10, baseline.runs10],
    ["12+ mile runs", generated.runs12, baseline.runs12],
    ["14+ mile runs", generated.runs14, baseline.runs14],
    ["18+ mile runs", generated.runs18, baseline.runs18],
    ["20+ mile runs", generated.runs20, baseline.runs20],
    ["Longest run", generated.longest, baseline.longest],
  ];

  return metrics.map(([metric, generatedValue, baselineValue]) => ({
    metric,
    generated: generatedValue,
    baseline: baselineValue,
    delta: round(generatedValue - baselineValue, 2),
  }));
}

export function resolveTrainingCycle(
  marathon: Marathon,
): ResolvedTrainingCycle {
  const baseline = marathon.cycle;

  if (!ENGINE_ENABLED_RACE_IDS.has(marathon.id)) {
    return {
      cycle: baseline,
      source: baseline ? "baseline" : "unavailable",
      baseline,
      deltas: [],
    };
  }

  const generated = buildTrainingCycle(activities, marathon.date);

  return {
    cycle: generated,
    source: "engine",
    baseline,
    deltas: baseline ? compareCycles(generated, baseline) : [],
  };
}
