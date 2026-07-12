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

export default function PrincipalDashboard() {
  const totalStudents = PHYSICS_SECTIONS.reduce((a, s) => a + s.students, 0);
  const totalActive = PHYSICS_SECTIONS.reduce((a, s) => a + s.active, 0);
  const completionRate = Math.round((totalActive / totalStudents) * 100);
  const avgScore = Math.round(PHYSICS_SECTIONS.reduce((a, s) => a + s.avgScore, 0) / PHYSICS_SECTIONS.length);
  const teachersActive = PHYSICS_SECTIONS.length;

  const subjectPerformance = [
    { subject: "Physics", avgScore, completion: completionRate, piloted: true },
    ...OTHER_SUBJECTS.map((s) => ({ subject: s, avgScore: 0, completion: 0, piloted: false })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Weekly completion" value={`${completionRate}%`} sub="active students, Physics" color="var(--brand2)" />
        <Kpi label="Teacher engagement" value={`${teachersActive}/${teachersActive}`} sub="Physics teachers active this week" />
        <Kpi label="ESL improvement" value="+8%" sub="avg score vs last month (demo estimate)" color="var(--good)" />
        <Kpi label="AI usage" value={`${PHYSICS_SECTIONS.reduce((a, s) => a + s.aiRelianceHigh, 0)}`} sub="students flagged for AI over-reliance" color="var(--warn)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="glass overflow-hidden rounded-3xl">
          <div className="px-5 py-3">
            <h2 className="font-semibold">Subject performance</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr className="border-y border-[var(--border)]">
                <th className="px-5 py-2.5">Subject</th>
                <th className="px-3 py-2.5">Avg score</th>
                <th className="px-3 py-2.5">Completion</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjectPerformance.map((s) => (
                <tr key={s.subject} className={`border-b border-[var(--border)] last:border-0 ${!s.piloted ? "opacity-50" : ""}`}>
                  <td className="px-5 py-2.5 font-medium">{s.subject}</td>
                  <td className="px-3 py-2.5 tabular-nums">{s.piloted ? `${s.avgScore}%` : "—"}</td>
                  <td className="px-3 py-2.5 tabular-nums">{s.piloted ? `${s.completion}%` : "—"}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {s.piloted ? (
                      <span className="text-[var(--good)]">● Live pilot</span>
                    ) : (
                      <span className="text-[var(--muted)]">Not yet piloted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="glass rounded-3xl p-5">
          <h3 className="mb-3 font-semibold">Teacher engagement</h3>
          <div className="space-y-2">
            {PHYSICS_SECTIONS.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
                <div>
                  <div className="font-medium">{s.teacher}</div>
                  <div className="text-[11px] text-[var(--muted)]">Physics · {s.name}</div>
                </div>
                <span className="text-xs text-[var(--good)]">● Active</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass rounded-3xl p-5">
        <h3 className="mb-1 font-semibold">Most difficult topics (school-wide)</h3>
        <p className="mb-3 text-[11px] text-[var(--muted)]">Based on live pilot data (Physics, Section B) — will expand as more subjects go live</p>
        <div className="grid gap-3 sm:grid-cols-2">
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
  );
}
