import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUILD_WEEKS,
  LEAD_IN_WEEKS,
  PRE_RACE_WINDOW_WEEKS,
  getPreRaceWindow,
  summarizePreRaceTraining,
} from "./training-window";

describe("training-window", () => {
  it("uses a 12-week build plus a 2-week lead-in", () => {
    expect(DEFAULT_BUILD_WEEKS).toBe(12);
    expect(LEAD_IN_WEEKS).toBe(2);
    expect(PRE_RACE_WINDOW_WEEKS).toBe(14);
  });

  it("calculates an inclusive-start, exclusive-race-day window", () => {
    expect(getPreRaceWindow("2024-10-13")).toEqual({
      start: "2024-07-07",
      endExclusive: "2024-10-13",
    });
  });

  it("includes the first day and excludes race day", () => {
    const summary = summarizePreRaceTraining(
      [
        { date: "2024-07-06", miles: 99 },
        { date: "2024-07-07", miles: 10 },
        { date: "2024-10-12", miles: 5 },
        { date: "2024-10-13", miles: 26.2 },
      ],
      "2024-10-13",
    );

    expect(summary.totalMiles).toBe(15);
    expect(summary.activityCount).toBe(2);
    expect(summary.averageMilesPerWeek).toBe(1.07);
  });

  it("rejects invalid window lengths", () => {
    expect(() => getPreRaceWindow("2024-10-13", 0)).toThrow(
      "positive integer",
    );
  });
});
