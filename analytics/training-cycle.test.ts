import { describe, expect, it } from "vitest";

import { buildTrainingCycle, type Activity } from "./training-cycle";

describe("buildTrainingCycle", () => {
  const raceDate = "2024-10-13";

  it("builds 14 Sunday-aligned weeks and excludes race day", () => {
    const activities: Activity[] = [
      { date: "2024-07-06", miles: 99 },
      { date: "2024-07-07", miles: 10, name: "Window opener" },
      { date: "2024-07-13", miles: 5 },
      { date: "2024-07-14", miles: 8 },
      { date: "2024-10-12", miles: 4 },
      { date: "2024-10-13", miles: 26.2 },
    ];

    const cycle = buildTrainingCycle(activities, raceDate);

    expect(cycle.start).toBe("2024-07-07");
    expect(cycle.weekly).toHaveLength(14);
    expect(cycle.weekly[0]).toMatchObject({
      week: "2024-07-07",
      miles: 15,
      runs: 2,
      activeDays: 2,
      longest: 10,
    });
    expect(cycle.weekly[1].week).toBe("2024-07-14");
    expect(cycle.weekly.at(-1)).toMatchObject({
      week: "2024-10-06",
      miles: 4,
    });
    expect(cycle.totalMiles).toBe(27);
    expect(cycle.runs).toBe(4);
  });

  it("calculates cycle totals, distance counts, and notable runs", () => {
    const activities: Activity[] = [
      {
        date: "2024-08-01",
        name: "Long w/ MP",
        miles: 20.25,
        paceSecPerMile: 510,
      },
      { date: "2024-08-04", name: "Medium long", miles: 14.1 },
      { date: "2024-08-06", name: "Easy", miles: 6.5 },
      { date: "2024-08-06", name: "Double", miles: 4 },
      { date: "2024-09-01", name: "Long", miles: 18.2 },
      { date: "2024-09-08", name: "Steady", miles: 12 },
      { date: "2024-09-15", name: "Ten", miles: 10 },
    ];

    const cycle = buildTrainingCycle(activities, raceDate, {
      notableRunLimit: 3,
    });

    expect(cycle.totalMiles).toBe(85.1);
    expect(cycle.activeDays).toBe(6);
    expect(cycle.runs10).toBe(5);
    expect(cycle.runs12).toBe(4);
    expect(cycle.runs14).toBe(3);
    expect(cycle.runs18).toBe(2);
    expect(cycle.runs20).toBe(1);
    expect(cycle.longest).toBe(20.25);
    expect(cycle.notable).toEqual([
      {
        date: "2024-08-01",
        name: "Long w/ MP",
        miles: 20.25,
        pace: 8.5,
      },
      { date: "2024-09-01", name: "Long", miles: 18.2, pace: null },
      {
        date: "2024-08-04",
        name: "Medium long",
        miles: 14.1,
        pace: null,
      },
    ]);
  });

  it("calculates taper reductions from the peak week", () => {
    const activities: Activity[] = [
      { date: "2024-09-22", miles: 30 },
      { date: "2024-09-23", miles: 30 },
      { date: "2024-09-29", miles: 40 },
      { date: "2024-10-06", miles: 20 },
    ];

    const cycle = buildTrainingCycle(activities, raceDate);

    expect(cycle.peakWeek).toBe(60);
    expect(cycle.taper).toEqual({
      peakWeekMiles: 60,
      penultimateWeekMiles: 40,
      raceWeekMiles: 20,
      penultimateReductionPercent: 33.3,
      raceWeekReductionPercent: 66.7,
    });
  });

  it("rejects invalid mileage and invalid options", () => {
    expect(() =>
      buildTrainingCycle([{ date: "2024-08-01", miles: -1 }], raceDate),
    ).toThrow("Invalid mileage");

    expect(() =>
      buildTrainingCycle([], raceDate, { notableRunLimit: -1 }),
    ).toThrow("non-negative integer");
  });
});
