import type { Question } from "@/lib/grade";

export type PracticeItem = {
  id: string;
  level: "Easy" | "Medium" | "Challenge";
  prompt: string;
  question: Question;
  source: string;
};

// All answers verified against the school's own worksheet/slide answer keys.
export const MOMENTS_BANK: PracticeItem[] = [
  {
    id: "e1",
    level: "Easy",
    prompt: "A force of 70 N turns a lever 0.4 m from the pivot P. Calculate the moment. State value, unit and direction (clockwise).",
    question: { kind: "numeric", expected: 28, unit: "Nm", direction: "clockwise" },
    source: "Worksheet 7, Q4 (answer key)",
  },
  {
    id: "m1",
    level: "Medium",
    prompt: "Ram (200 N) sits 1.5 m from a seesaw pivot. What weight must Shyam be at 1.0 m to balance it? (Give value + unit.)",
    question: { kind: "numeric", expected: 300, unit: "N" },
    source: "Moments of Force — Slides 5–6",
  },
  {
    id: "c1",
    level: "Challenge",
    prompt: "The moment of a force is 42 Nm and it acts 7 cm from the pivot. Calculate the force. (Convert cm → m first! Value + unit.)",
    question: { kind: "numeric", expected: 600, unit: "N", tolerance: 2 },
    source: "Moments of Force — Slides 14–15",
  },
];

export const DISTANCE_TIME_BANK: PracticeItem[] = [
  {
    id: "e1",
    level: "Easy",
    prompt: "A worker cycles 200 m from home to the factory, taking 1 minute 40 seconds (100 s). Calculate the average speed. (Value + unit.)",
    question: { kind: "numeric", expected: 2, unit: "m/s" },
    source: "Worksheet 2, Q1 (answer key)",
  },
  {
    id: "m1",
    level: "Medium",
    prompt: "On a distance-time graph, distance goes from 50 m to 150 m as time goes from 1 s to 3 s. Calculate the gradient (speed) of the line. (Value + unit.)",
    question: { kind: "numeric", expected: 50, unit: "m/s" },
    source: "Distance-Time Graphs — Slides 13–14 (worked example)",
  },
  {
    id: "c1",
    level: "Challenge",
    prompt: "A student walked 5 m in 10 s, stopped for 10 s, then walked 5 m in 5 s. What was the speed during the LAST 5 seconds (after stopping)? (Value + unit.)",
    question: { kind: "numeric", expected: 1, unit: "m/s", tolerance: 0.05 },
    source: "Distance-Time Graphs — Slide 10",
  },
];
