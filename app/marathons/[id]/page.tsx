import { PRE_RACE_WINDOW_WEEKS } from "@/analytics/training-window";
import WeeklyBars from "@/components/WeeklyBars";
import racesJson from "@/data/marathons.json";
import {
  resolveTrainingCycle,
  type CycleMetricDelta,
} from "@/lib/training-cycle-data";
import type { Marathon } from "@/lib/types";
import { notFound } from "next/navigation";

const races = racesJson as Marathon[];

export function generateStaticParams() {
  return races.map((race) => ({ id: race.id }));
}

function DeltaTable({ deltas }: { deltas: CycleMetricDelta[] }) {
  if (deltas.length === 0) return null;

  return (
    <section>
      <h2>Engine validation</h2>

      <div className="notice">
        Chicago 2024 is calculated from the activity dataset. The original
        precomputed JSON remains available as a migration baseline.
      </div>

      <div className="card" style={{ marginTop: 14, overflowX: "auto" }}>
        <table className="metric-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Generated</th>
              <th>Baseline</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {deltas.map((entry) => (
              <tr key={entry.metric}>
                <td>{entry.metric}</td>
                <td>{entry.generated}</td>
                <td>{entry.baseline}</td>
                <td>
                  {entry.delta > 0 ? "+" : ""}
                  {entry.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const race = races.find((candidate) => candidate.id === id);

  if (!race) notFound();

  const resolved = resolveTrainingCycle(race);
  const cycle = resolved.cycle;

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">
            {race.date} · {race.goal ? "Goal race" : "Context race"}
          </p>
          <h1>{race.race}</h1>
          <p className="lede">{race.context}</p>
        </div>

        <div className="card stat">
          <span className="muted">{race.year} finish</span>
          <b>{race.finish}</b>
          {race.split && (
            <span
              className={
                race.split.toLowerCase().includes("negative")
                  ? "split-good"
                  : "muted"
              }
            >
              {race.split}
            </span>
          )}
        </div>
      </section>

      <h2>Race summary</h2>
      <section className="grid">
        <div className="card stat">
          <span className="muted">Finish</span>
          <b>{race.finish}</b>
        </div>
        <div className="card stat">
          <span className="muted">Half</span>
          <b>{race.half || "—"}</b>
        </div>
        <div className="card stat">
          <span className="muted">Split</span>
          <b style={{ fontSize: 22 }}>{race.split || "—"}</b>
        </div>
        <div className="card stat">
          <span className="muted">Role</span>
          <b style={{ fontSize: 22 }}>{race.goal ? "Goal" : "Context"}</b>
        </div>
      </section>

      {cycle ? (
        <>
          <h2>{PRE_RACE_WINDOW_WEEKS}-week build</h2>

          {resolved.source === "engine" && (
            <div className="notice">
              <strong>Source:</strong> generated from the versioned activity
              dataset by the Training Cycle Engine.
            </div>
          )}

          <section className="grid" style={{ marginTop: 14 }}>
            <div className="card stat">
              <span className="muted">Average/week</span>
              <b>{cycle.avgWeek}</b>
            </div>
            <div className="card stat">
              <span className="muted">Peak week</span>
              <b>{cycle.peakWeek}</b>
            </div>
            <div className="card stat">
              <span className="muted">14+ mile runs</span>
              <b>{cycle.runs14}</b>
            </div>
            <div className="card stat">
              <span className="muted">Longest run</span>
              <b>{cycle.longest}</b>
            </div>
          </section>

          <h2>Weekly mileage</h2>
          <WeeklyBars cycle={cycle} />

          <section className="detail-grid">
            <div>
              <h2>Cycle metrics</h2>
              <div className="card">
                <table className="metric-table">
                  <tbody>
                    {Object.entries({
                      "Total miles": cycle.totalMiles,
                      Runs: cycle.runs,
                      "Active days": cycle.activeDays,
                      "10+ mile runs": cycle.runs10,
                      "12+ mile runs": cycle.runs12,
                      "18+ mile runs": cycle.runs18,
                      "20+ mile runs": cycle.runs20,
                    }).map(([label, value]) => (
                      <tr key={label}>
                        <th>{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2>Longest activities</h2>
              <div className="card">
                <table className="metric-table">
                  <tbody>
                    {cycle.notable.map((run) => (
                      <tr key={`${run.date}-${run.name}`}>
                        <td>
                          <strong>{run.date}</strong>
                          <div className="muted">{run.name}</div>
                        </td>
                        <td>{run.miles} mi</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <DeltaTable deltas={resolved.deltas} />
        </>
      ) : (
        <>
          <h2>Training data</h2>
          <div className="notice">
            The available exports do not cover this race&apos;s full{" "}
            {PRE_RACE_WINDOW_WEEKS}-week build. Race history is preserved, but
            training metrics are intentionally left blank.
          </div>
        </>
      )}
    </>
  );
}
