// Mock department-level rollup for the HOD/Principal views. Section B's
// numbers deliberately mirror the real per-student data in data/monitoring.ts
// (the only section with live student-level mock data in this demo) so the
// three role views stay internally consistent. Sections A and C are
// additional illustrative sections showing what a real multi-class
// department view looks like.

export type SectionSummary = {
  id: string;
  name: string;
  teacher: string;
  students: number;
  active: number;
  avgScore: number;
  avgMinutes: number;
  aiRelianceHigh: number;
  topicsCovered: number;
  topicsPlanned: number;
};

export const PHYSICS_SECTIONS: SectionSummary[] = [
  { id: "a", name: "Section A", teacher: "Mr. Osei", students: 22, active: 19, avgScore: 71, avgMinutes: 29, aiRelianceHigh: 3, topicsCovered: 1, topicsPlanned: 6 },
  { id: "b", name: "Section B", teacher: "Ms. Chen (you)", students: 24, active: 21, avgScore: 72, avgMinutes: 36, aiRelianceHigh: 1, topicsCovered: 1, topicsPlanned: 6 },
  { id: "c", name: "Section C", teacher: "Ms. Patel", students: 23, active: 22, avgScore: 82, avgMinutes: 41, aiRelianceHigh: 0, topicsCovered: 1, topicsPlanned: 6 },
];

// Other subjects have no live sections in this demo yet — shown honestly as
// "not yet piloted" in the HOD/Principal views rather than invented numbers.
export const OTHER_SUBJECTS = ["Mathematics", "Science", "English"];
