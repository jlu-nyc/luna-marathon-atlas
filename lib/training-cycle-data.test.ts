import { describe, expect, it } from "vitest";
import racesJson from "@/data/marathons.json";
import type { Marathon } from "@/lib/types";
import type { Activity } from "@/analytics/training-cycle";
import {
  compareCycles,
  getActivityCoverage,
  hasCompleteActivityCoverage,
  resolveTrainingCycle,
} from "./training-cycle-data";
import { buildTrainingCycle } from "@/analytics/training-cycle";

const races = racesJson as Marathon[];

describe("training-cycle data integration", () => {
  const coveredDataset: Activity[] = [
    { date: "2024-07-01", miles: 5 },
    { date: "2024-09-01", miles: 10 },
    { date: "2024-10-12", miles: 3 },
  ];

  it("reports the activity dataset date range", () => {
    expect(getActivityCoverage(coveredDataset)).toEqual({
      firstActivityDate: "2024-07-01",
      lastActivityDate: "2024-10-12",
    });
  });

  it("requires coverage from the window start through the day before race day", () => {
    expect(
      hasCompleteActivityCoverage("2024-10-13", coveredDataset),
    ).toBe(true);

    expect(
      hasCompleteActivityCoverage("2024-10-13", [
        { date: "2024-07-08", miles: 5 },
        { date: "2024-10-12", miles: 3 },
      ]),
    ).toBe(false);

    expect(
      hasCompleteActivityCoverage("2024-10-13", [
        { date: "2024-07-01", miles: 5 },
        { date: "2024-10-11", miles: 3 },
      ]),
    ).toBe(false);
  });

  it("uses the engine when a complete activity window exists", () => {
    const marathon = {
      id: "test-race",
      race: "Test Marathon",
      year: 2024,
      date: "2024-10-13",
      finish: "3:30:00",
      half: null,
      split: null,
      goal: true,
      context: "Test",
      cycle: null,
    } satisfies Marathon;

    const resolved = resolveTrainingCycle(marathon, coveredDataset);

    expect(resolved.source).toBe("engine");
    expect(resolved.cycle?.weekly).toHaveLength(14);
    expect(resolved.baseline).toBeNull();
    expect(resolved.deltas).toEqual([]);
  });

  it("falls back to the baseline when coverage is incomplete", () => {
    const race = races.find((candidate) => candidate.cycle !== null);

    expect(race).toBeDefined();

    const resolved = resolveTrainingCycle(race!, [
      { date: race!.date, miles: 1 },
    ]);

    expect(resolved.source).toBe("baseline");
    expect(resolved.cycle).toBe(race?.cycle);
    expect(resolved.deltas).toEqual([]);
  });

  it("never creates a partial engine cycle when no baseline exists", () => {
    const marathon = {
      id: "uncovered-race",
      race: "Uncovered Marathon",
      year: 2010,
      date: "2010-11-07",
      finish: "3:38:00",
      half: null,
      split: null,
      goal: true,
      context: "Test",
      cycle: null,
    } satisfies Marathon;

    const resolved = resolveTrainingCycle(marathon, coveredDataset);

    expect(resolved).toEqual({
      cycle: null,
      source: "unavailable",
      baseline: null,
      deltas: [],
    });
  });

  it("reports signed metric differences", () => {
    const generated = buildTrainingCycle(
      [
        { date: "2024-09-01", miles: 10 },
        { date: "2024-09-08", miles: 12 },
      ] satisfies Activity[],
      "2024-10-13",
      { weeks: 6 },
    );

    const baseline = {
      start: generated.start,
      totalMiles: 20,
      avgWeek: 3.3,
      peakWeek: 11,
      runs: 2,
      activeDays: 2,
      runs10: 2,
      runs12: 1,
      runs14: 0,
      runs18: 0,
      runs20: 0,
      longest: 12,
      weekly: generated.weekly,
      notable: generated.notable,
    };

    const deltas = compareCycles(generated, baseline);
    const totalMiles = deltas.find((entry) => entry.metric === "Total miles");

    expect(totalMiles).toEqual({
      metric: "Total miles",
      generated: 22,
      baseline: 20,
      delta: 2,
    });
  });

  it("keeps Chicago 2024 engine-generated with the real versioned dataset", () => {
    const chicago = races.find((race) => race.id === "chicago-2024");

    expect(chicago).toBeDefined();

    const resolved = resolveTrainingCycle(chicago!);

    expect(resolved.source).toBe("engine");
    expect(resolved.cycle?.weekly).toHaveLength(14);
  });
});
