import { describe, expect, it } from "vitest";
import racesJson from "@/data/marathons.json";
import type { Marathon } from "@/lib/types";
import {
  ENGINE_ENABLED_RACE_IDS,
  compareCycles,
  resolveTrainingCycle,
} from "./training-cycle-data";
import { buildTrainingCycle, type Activity } from "@/analytics/training-cycle";

const races = racesJson as Marathon[];

describe("training-cycle data integration", () => {
  it("enables the engine only for the controlled Chicago 2024 pilot", () => {
    expect([...ENGINE_ENABLED_RACE_IDS]).toEqual(["chicago-2024"]);
  });

  it("generates Chicago 2024 from activity data while retaining its baseline", () => {
    const chicago = races.find((race) => race.id === "chicago-2024");

    expect(chicago).toBeDefined();
    expect(chicago?.cycle).not.toBeNull();

    const resolved = resolveTrainingCycle(chicago!);

    expect(resolved.source).toBe("engine");
    expect(resolved.cycle).not.toBeNull();
    expect(resolved.baseline).not.toBeNull();
    expect(resolved.cycle?.start).toBe(resolved.baseline?.start);
    expect(resolved.cycle?.weekly).toHaveLength(14);
    expect(resolved.deltas.length).toBeGreaterThan(0);
  });

  it("keeps non-pilot races on their existing baseline", () => {
    const race = races.find(
      (candidate) =>
        candidate.id !== "chicago-2024" && candidate.cycle !== null,
    );

    expect(race).toBeDefined();

    const resolved = resolveTrainingCycle(race!);

    expect(resolved.source).toBe("baseline");
    expect(resolved.cycle).toBe(race?.cycle);
    expect(resolved.deltas).toEqual([]);
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
});
