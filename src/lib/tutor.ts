import { CORPUS, TOPIC, type CorpusChunk } from "@/data/corpus";

export type Intent = "explain" | "translate" | "example" | "askme" | "check";
export type EslLevel = "advanced" | "intermediate" | "beginner" | "beginner_zh";

// Vectorless / long-context RAG: for a small curated per-topic corpus we inject
// the whole approved set and force the model to cite. No embeddings, no drift.
export function corpusForTopic(topicId: string): CorpusChunk[] {
  return CORPUS.filter((c) => c.topicId === topicId);
}

function corpusBlock(chunks: CorpusChunk[]): string {
  return chunks
    .map((c) => `<source id="${c.id}" cite="${c.source}">\n${c.heading}: ${c.text}\n</source>`)
    .join("\n\n");
}

const LEVEL_GUIDE: Record<EslLevel, string> = {
  advanced: "The student has strong English. Use normal academic English.",
  intermediate:
    "The student is an intermediate ESL learner. Use simpler English, short sentences, and define hard words in brackets.",
  beginner:
    "The student is a beginner ESL learner. Use very simple English, very short sentences, and everyday words. Explain every technical term.",
  beginner_zh:
    "The student is a beginner ESL learner whose first language is Chinese. Use very simple English, then give a short Simplified Chinese (中文) gloss in brackets after key sentences and technical terms.",
};

const INTENT_GUIDE: Record<Intent, string> = {
  explain:
    "EXPLAIN the concept the student asks about, simply and step by step. Do NOT give the final answer to any assignment question — teach the idea instead.",
  example:
    "Give ONE clear worked EXAMPLE from the approved material, showing the formula and each step. Then invite the student to try a similar one.",
  askme:
    "Do NOT explain. Ask the student 2–3 short GUIDING questions (Socratic) that lead them toward understanding. Wait for their thinking.",
  check:
    "The student will show their attempt. Give a HINT about what to check — never just the answer. Point them to the relevant rule or step.",
  translate: "Translate faithfully; keep physics terms accurate.",
};

// "askme" needs a different instruction once the student has actually replied
// to a previous guiding question — otherwise the model just fires MORE
// unrelated questions instead of reacting to what the student said.
function intentGuide(intent: Intent, turn: number): string {
  if (intent === "askme" && turn > 0) {
    return (
      "The student has just responded to your previous guiding question(s) — check the conversation history for what they said. " +
      "Briefly react to it (confirm if they're on the right track, or gently correct a misconception using the approved material), " +
      "THEN ask 1–2 NEW guiding questions that go further. Do not just repeat earlier questions."
    );
  }
  return INTENT_GUIDE[intent];
}

export function buildSystemPrompt(topicId: string, level: EslLevel, intent: Intent, turn = 0): string {
  const chunks = corpusForTopic(topicId);
  const progressNote =
    turn > 0
      ? `\n6. The student has used "${intent}" ${turn + 1} times in this conversation — look at the conversation history and do NOT repeat a previous reply. Go deeper, use a different worked example, or ask different guiding questions than before.`
      : "";
  return `You are the ESL Learning Hub tutor for ${TOPIC.grade} ${TOPIC.subject}, topic "${TOPIC.title}".
You are a patient guide for English-as-a-Second-Language students at an international school (IG & IB curriculum).

ABSOLUTE RULES — follow every time:
1. Answer ONLY using the APPROVED MATERIAL between <source> tags below. This is the school's own textbook/slides/worksheets.
2. If the question cannot be answered from the approved material, say so briefly and steer the student back to the topic. Do NOT use outside/internet knowledge, and do NOT guess.
3. ALWAYS end your reply with a citation line naming the source(s) you used, formatted exactly as:
   "📖 Based on: <cite value>"
4. NEVER complete a whole assignment or give the final numeric answer to a task the student must do. Guide, hint, and ask questions instead (academic integrity).
5. Be encouraging and concise. ${LEVEL_GUIDE[level]}${progressNote}

TASK MODE: ${intentGuide(intent, turn)}

APPROVED MATERIAL:
${corpusBlock(chunks)}`;
}

export type FallbackResult = { text: string; sourceId?: string };

// Rotation order for demo/offline mode — every repeated tap of a button
// surfaces genuinely different, corpus-grounded content instead of a static
// canned reply. (Live mode gets real variety from conversation memory instead;
// see route.ts, which now threads full history to Claude.)
const EXPLAIN_IDS = ["m-def", "m-principle", "m-net", "m-ws7-lever"];
const EXAMPLE_IDS = ["m-seesaw", "m-rearrange", "m-ws7-rock"];
const ASKME_SETS: { chunkId: string; qs: string[] }[] = [
  {
    chunkId: "m-def",
    qs: [
      "What two things does the size of a moment depend on?",
      "What is the unit of a moment, and why is it that unit?",
    ],
  },
  {
    chunkId: "m-principle",
    qs: [
      "When a seesaw is balanced, what must be true about the clockwise and anticlockwise moments?",
      "What do we call the fixed point a beam turns around?",
    ],
  },
  {
    chunkId: "m-net",
    qs: [
      "If the clockwise moments add up to more than the anticlockwise moments, which way will the beam turn?",
      "How do you work out the net moment when several forces act on a beam?",
    ],
  },
  {
    chunkId: "m-ws7-lever",
    qs: [
      "Besides the number, what two other things must you always state in a moments answer?",
      "Why must you convert distances to metres before calculating a moment?",
    ],
  },
];

function byId(id: string): CorpusChunk {
  const c = CORPUS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown corpus chunk: ${id}`);
  return c;
}
const citeOf = (c: CorpusChunk) => `📖 Based on: ${c.source} (demo mode)`;

// Hints for "Check My Answer", one per numeric worked-example chunk — used
// only when we know WHICH problem the student is working on (contextChunkId).
// Without that, there is nothing real to check, so we say so honestly instead
// of guessing (see the "check" case below).
const CHECK_HINTS: Record<string, string> = {
  "m-seesaw":
    "did you set clockwise moment = anticlockwise moment (F₁×d₁ = F₂×d₂)? Have you correctly identified which weight or distance you're solving for?",
  "m-rearrange":
    "did you rearrange Moment = Force × distance into Force = Moment ÷ distance? Did you convert the distance from cm to metres first?",
  "m-ws7-lever":
    "did you use Moment = Force × distance, and did you convert the distance to metres first? Did you state the unit (Nm) and the direction (clockwise / anticlockwise)?",
  "m-ws7-rock":
    "did you calculate the moment for the person AND the rock separately (Moment = Force × distance for each) before comparing them?",
};

// Deterministic fallback so the UI is fully demoable before an API key is set.
export function fallbackReply(
  intent: Intent,
  question: string,
  turn = 0,
  contextChunkId?: string,
): FallbackResult {
  switch (intent) {
    case "explain": {
      const id = EXPLAIN_IDS[turn % EXPLAIN_IDS.length];
      const c = byId(id);
      const lead = turn === 0 ? "" : "Let's go a bit deeper — ";
      return { text: `${lead}${c.text}\n\n${citeOf(c)}`, sourceId: id };
    }
    case "example": {
      const id = EXAMPLE_IDS[turn % EXAMPLE_IDS.length];
      const c = byId(id);
      return {
        text: `Worked example: ${c.text}\n\nNow try a similar one yourself!\n\n${citeOf(c)}`,
        sourceId: id,
      };
    }
    case "askme": {
      const setIdx = turn % ASKME_SETS.length;
      const set = ASKME_SETS[setIdx];
      const c = byId(set.chunkId);
      const qs = set.qs.map((q, i) => `${i + 1}. ${q}`).join("\n");
      if (turn === 0) {
        return { text: `Let's think it through together:\n${qs}\n\n${citeOf(c)}`, sourceId: set.chunkId };
      }
      // The student has replied to the previous question(s) — acknowledge and
      // reveal the key idea behind THAT question before asking new ones, so
      // this feels like a real back-and-forth instead of a random restart.
      const prevSet = ASKME_SETS[(turn - 1) % ASKME_SETS.length];
      const prevChunk = byId(prevSet.chunkId);
      return {
        text: `Nice thinking! Here's the key idea to check your answer against: ${prevChunk.text}\n\nNow let's go further:\n${qs}\n\n${citeOf(c)}`,
        sourceId: set.chunkId,
      };
    }
    case "check": {
      if (contextChunkId && CHECK_HINTS[contextChunkId]) {
        const c = byId(contextChunkId);
        return {
          text: `Let's check your working — ${CHECK_HINTS[contextChunkId]} Fix that, then show me again.\n\n${citeOf(c)}`,
          sourceId: contextChunkId,
        };
      }
      // No established problem in this conversation — don't guess or point at
      // an unrelated worksheet. Ask the student to establish context first.
      return {
        text:
          "I don't have a specific question in view yet, so I can't check your working against the right numbers. " +
          'Tap "Explain" or "Give Example" first (or type the question above), then tap Check My Answer again.',
      };
    }
    case "translate": {
      // The Translate button now calls /api/translate directly (see AiTutorPanel),
      // which has reviewed per-chunk translations. This case is a rarely-hit
      // fallback if /api/tutor is ever called with intent=translate directly.
      const c = byId("m-def");
      return {
        text: `力矩是力的转动效果。力矩 = 力 × 到支点的垂直距离，单位是牛顿·米（Nm）。\n\n${citeOf(c)}`,
        sourceId: c.id,
      };
    }
    default:
      return { text: `I can help with "${question || "moments"}" using your class material. Try the Explain or Example button.` };
  }
}
