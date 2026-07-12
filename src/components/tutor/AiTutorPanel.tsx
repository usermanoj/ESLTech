"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Intent = "explain" | "translate" | "example" | "askme" | "check";
type EslLevel = "advanced" | "intermediate" | "beginner" | "beginner_zh";
type Msg = {
  role: "user" | "ai";
  text: string;      // display text (may be prefixed with a button label for user turns)
  raw?: string;       // the actual content sent to / returned from the model, for history
  cite?: string;
  demo?: boolean;
  chunkId?: string;      // which approved-corpus chunk this AI reply was grounded in (demo mode)
  isTranslation?: boolean; // true for a Translate result — never re-translate a translation
};

const BUTTONS: { intent: Intent; label: string; icon: string; hint: string }[] = [
  { intent: "explain", label: "Explain", icon: "💡", hint: "Explain this simply" },
  { intent: "example", label: "Give Example", icon: "🧮", hint: "Show a worked example" },
  { intent: "askme", label: "Ask Me Questions", icon: "❓", hint: "Quiz me (Socratic)" },
  { intent: "check", label: "Check My Answer", icon: "✅", hint: "Hint on my attempt" },
  { intent: "translate", label: "Translate", icon: "🌏", hint: "Translate the last reply" },
];

const LEVELS: { id: EslLevel; label: string }[] = [
  { id: "advanced", label: "English (advanced)" },
  { id: "intermediate", label: "Simplified English" },
  { id: "beginner", label: "Beginner English" },
  { id: "beginner_zh", label: "English + 中文" },
];

const DEFAULT_TRANSLATE_SOURCE =
  "A moment is the turning effect of a force. Moment = force × perpendicular distance from the pivot.";

function splitCite(text: string): { body: string; cite?: string } {
  const idx = text.indexOf("📖 Based on:");
  if (idx === -1) return { body: text };
  return { body: text.slice(0, idx).trim(), cite: text.slice(idx).trim() };
}

// --- Language-aware read-aloud -------------------------------------------
// Splits mixed English/Chinese text into runs so each run is spoken with the
// correct voice+lang (a single English-tagged utterance mispronounces or
// silently skips Chinese characters). Also works around a long-standing
// Chrome bug where utterances longer than ~15s silently stop.
const CJK_RANGE = /[㐀-鿿＀-￯]/;

function splitByLanguage(text: string): { text: string; lang: "zh-CN" | "en-US" }[] {
  const parts = text.match(/[㐀-鿿＀-￯]+|[^㐀-鿿＀-￯]+/g) || [text];
  return parts
    .map((p) => ({ text: p, lang: (CJK_RANGE.test(p[0] ?? "") ? "zh-CN" : "en-US") as "zh-CN" | "en-US" }))
    .filter((p) => p.text.trim().length > 0);
}

let voicesCache: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && window.speechSynthesis) {
  const loadVoices = () => {
    voicesCache = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  return (
    voicesCache.find((v) => v.lang === lang) ||
    voicesCache.find((v) => v.lang.toLowerCase().startsWith(lang.split("-")[0].toLowerCase()))
  );
}

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const segments = splitByLanguage(text);
  let i = 0;
  const speakNext = () => {
    if (i >= segments.length) return;
    const seg = segments[i++];
    const u = new SpeechSynthesisUtterance(seg.text);
    u.lang = seg.lang;
    const voice = pickVoice(seg.lang);
    if (voice) u.voice = voice;
    u.rate = seg.lang === "zh-CN" ? 0.85 : 0.92;
    u.onend = speakNext;
    u.onerror = speakNext;
    synth.speak(u);
  };
  speakNext();
  // Chrome workaround: long speech silently halts unless kept alive.
  const keepAlive = setInterval(() => {
    if (!synth.speaking) {
      clearInterval(keepAlive);
      return;
    }
    synth.pause();
    synth.resume();
  }, 5000);
}
// ---------------------------------------------------------------------------

export default function AiTutorPanel({ topicTitle }: { topicTitle: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text:
        `Hi! I'm your ${topicTitle} tutor. I only use your class materials, and I'll always show you where the answer comes from. Pick a button below — I won't just give you answers, I'll help you learn. 🎓`,
    },
  ]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [level, setLevel] = useState<EslLevel>("intermediate");
  const [loading, setLoading] = useState<Intent | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const turnCounts = useRef<Partial<Record<Intent, number>>>({});
  // Which conversational mode the free-text box continues when you hit Enter —
  // without this it always defaulted to "explain", so replying to a Socratic
  // question got mislabelled and answered as an unrelated new explanation.
  const [lastIntent, setLastIntent] = useState<Intent>("explain");

  async function ask(intent: Intent) {
    if (intent === "check" && !showCheck) {
      setShowCheck(true);
      return;
    }

    const q = question.trim() || `Help me with ${topicTitle}`;
    const ans = answer;
    // Clear inputs immediately so leftover text never lingers into the next turn.
    setQuestion("");
    setAnswer("");

    const label = BUTTONS.find((b) => b.intent === intent)?.label ?? intent;
    const userRaw = intent === "check" ? ans : q;
    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: intent === "check" ? `Check my answer: ${ans || "(my working)"}` : `${label}: ${q}`,
        raw: userRaw,
      },
    ]);
    setLoading(intent);

    try {
      if (intent === "translate") {
        // Skip past any previous translation output — translating a
        // translation isn't meaningful, and it has no corpus sourceId, which
        // used to make repeated Translate presses degrade into "no match".
        const lastAi = [...messages].reverse().find((m) => m.role === "ai" && !m.isTranslation);
        const sourceText = lastAi?.text || DEFAULT_TRANSLATE_SOURCE;
        const sourceId = lastAi?.chunkId;
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sourceText, sourceId }),
        });
        const data = await res.json();
        const { body, cite } = splitCite(data.translation || "");
        setMessages((m) => [
          ...m,
          { role: "ai", text: body, raw: body, cite, demo: data.demo, isTranslation: true, chunkId: sourceId },
        ]);
        return;
      }

      const turn = turnCounts.current[intent] ?? 0;
      turnCounts.current[intent] = turn + 1;

      // Which approved-corpus problem the conversation is currently about —
      // needed so "Check My Answer" can hint at the RIGHT problem instead of
      // an unrelated hardcoded one.
      const contextChunkId = [...messages].reverse().find((m) => m.role === "ai" && m.chunkId)?.chunkId;

      // Real conversation memory: without this, the model can't tell what it
      // already said, so "then?" / "what next?" has nothing to build on.
      const history = messages
        .filter((m) => m.raw !== undefined || m.role === "ai")
        .map((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.raw ?? m.text,
        }));

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, question: q, level, answer: ans, turn, history, contextChunkId }),
      });
      const data = await res.json();
      const { body, cite } = splitCite(data.reply || "");
      setMessages((m) => [
        ...m,
        { role: "ai", text: body, raw: body, cite, demo: data.demo, chunkId: data.sourceId ?? contextChunkId },
      ]);
      if (intent === "explain" || intent === "example" || intent === "askme") setLastIntent(intent);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "⚠️ Network problem — please try again." }]);
    } finally {
      setLoading(null);
      setShowCheck(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 60);
    }
  }

  return (
    <div className="glass-strong flex h-full flex-col rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand)] text-lg glow-brand">🤖</span>
          <div>
            <div className="font-semibold leading-tight">AI Learning Assistant</div>
            <div className="text-xs text-[var(--muted)]">Curriculum-locked · cites sources</div>
          </div>
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as EslLevel)}
          className="glass rounded-xl px-2 py-1.5 text-xs outline-none"
        >
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id} className="bg-[#0e1530]">{l.label}</option>
          ))}
        </select>
      </div>

      <div ref={scrollRef} className="min-h-[240px] flex-1 space-y-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[var(--brand)] text-white"
                    : "glass text-[var(--text)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.cite && (
                  <div className="mt-2 rounded-lg bg-[rgba(34,211,238,0.12)] px-2 py-1 text-xs text-[var(--brand2)]">
                    {m.cite}
                  </div>
                )}
                {m.role === "ai" && (
                  <div className="mt-1.5 flex items-center gap-3">
                    <button onClick={() => speak(m.text)} className="text-xs text-[var(--muted)] hover:text-[var(--text)]">🔊 Read aloud</button>
                    {m.demo && <span className="text-[10px] text-[var(--warn)]">demo mode (no API key)</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-2.5 text-sm text-[var(--muted)]">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.15s]">●</span>
                <span className="animate-bounce [animation-delay:0.3s]">●</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCheck && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer + working (e.g. 70 × 0.4 = 28 Nm clockwise)"
              className="mt-3 w-full rounded-xl bg-black/20 px-3 py-2 text-sm outline-none ring-1 ring-[var(--border)] focus:ring-[var(--brand)]"
              onKeyDown={(e) => e.key === "Enter" && ask("check")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            lastIntent === "askme"
              ? "Type your answer to continue…"
              : "Ask about moments… (or just tap a button)"
          }
          className="mb-2 w-full rounded-xl bg-black/20 px-3 py-2 text-sm outline-none ring-1 ring-[var(--border)] focus:ring-[var(--brand)]"
          onKeyDown={(e) => e.key === "Enter" && ask(lastIntent)}
        />
        <div className="grid grid-cols-5 gap-2">
          {BUTTONS.map((b) => (
            <button
              key={b.intent}
              onClick={() => ask(b.intent)}
              disabled={!!loading}
              title={b.hint}
              className="group flex flex-col items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-[var(--surface-2)] disabled:opacity-50"
            >
              <span className="text-xl transition group-hover:scale-110">{b.icon}</span>
              <span className="text-[11px] font-medium leading-tight">{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
