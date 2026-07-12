"use client";

import { motion } from "framer-motion";
import { PHYSICS_SECTIONS, OTHER_SUBJECTS } from "@/data/department";
import { DIFFICULT_TOPICS } from "@/data/monitoring";

function Kpi({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-3xl p-4">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={{ color: color || "var(--text)" }}>{value}</div>
      {sub && <div className="text-xs text-[var(--muted)]">{sub}</div>}
    </div>
  );
}

export default function HodDashboard() {
  const totalStudents = PHYSICS_SECTIONS.reduce((a, s) => a + s.students, 0);
  const totalActive = PHYSICS_SECTIONS.reduce((a, s) => a + s.active, 0);
  const avgScore = Math.round(PHYSICS_SECTIONS.reduce((a, s) => a + s.avgScore, 0) / PHYSICS_SECTIONS.length);
  const totalHighReliance = PHYSICS_SECTIONS.reduce((a, s) => a + s.aiRelianceHigh, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Physics sections" value={`${PHYSICS_SECTIONS.length}`} sub={`${totalStudents} students total`} color="var(--brand2)" />
        <Kpi label="Active this week" value={`${totalActive}/${totalStudents}`} />
        <Kpi label="Department avg score" value={`${avgScore}%`} />
        <Kpi
          label="Over-relying on AI"
          value={`${totalHighReliance}`}
          sub="across all sections"
          color={totalHighReliance > 0 ? "var(--bad)" : "var(--good)"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="glass overflow-hidden rounded-3xl">
          <div className="px-5 py-3">
            <h2 className="font-semibold">Physics — section comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr className="border-y border-[var(--border)]">
                  <th className="px-5 py-2.5">Section</th>
                  <th className="px-3 py-2.5">Teacher</th>
                  <th className="px-3 py-2.5">Active</th>
                  <th className="px-3 py-2.5">Avg score</th>
                  <th className="px-3 py-2.5">Avg time</th>
                  <th className="px-3 py-2.5">AI reliance (high)</th>
                  <th className="px-3 py-2.5">Curriculum coverage</th>
                </tr>
              </thead>
              <tbody>
                {PHYSICS_SECTIONS.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-5 py-2.5 font-medium">{s.name}</td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">{s.teacher}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.active}/{s.students}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.avgScore}%</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.avgMinutes}m</td>
                    <td
                      className="px-3 py-2.5 tabular-nums"
                      style={{ color: s.aiRelianceHigh > 0 ? "var(--warn)" : "var(--good)" }}
                    >
                      {s.aiRelianceHigh}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">{s.topicsCovered}/{s.topicsPlanned} topics</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">
            {OTHER_SUBJECTS.join(", ")} are not yet piloted on the platform — no sections to show yet.
          </div>
        </section>

        <section className="glass rounded-3xl p-5">
          <h3 className="mb-1 font-semibold">Most difficult topics</h3>
          <p className="mb-3 text-[11px] text-[var(--muted)]">Based on live pilot data (Section B)</p>
          <div className="space-y-2.5">
            {DIFFICULT_TOPICS.map((t) => (
              <div key={t.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{t.label}</span>
                  <span className="text-[var(--muted)]">{t.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,var(--brand2),var(--accent))" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
