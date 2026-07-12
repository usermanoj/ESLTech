import { NextRequest, NextResponse } from "next/server";
import { claude, hasApiKey, MODEL } from "@/lib/claude";
import { buildSystemPrompt, fallbackReply, type Intent, type EslLevel } from "@/lib/tutor";

export const runtime = "nodejs";

type HistoryTurn = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const { intent, question, level, answer, turn, history } = (await req.json()) as {
      intent: Intent;
      question: string;
      level: EslLevel;
      answer?: string;
      turn?: number;
      history?: HistoryTurn[];
    };
    const turnNum = turn ?? 0;

    if (!hasApiKey()) {
      const fb = fallbackReply(intent, question, turnNum);
      return NextResponse.json({ reply: fb.text, demo: true, sourceId: fb.sourceId });
    }

    const system = buildSystemPrompt("moments", level ?? "intermediate", intent ?? "explain", turnNum);
    const userText =
      intent === "check" && answer
        ? `Here is my attempt at: "${question}"\n\nMy answer/working: ${answer}\n\nGive me a hint about what to check — do not give the final answer.`
        : question || "Please help me understand this topic.";

    // Thread real conversation history so the model actually remembers what it
    // already said — without this, "then?" / "what next?" has nothing to build on.
    const priorTurns = (history ?? []).map((h) => ({ role: h.role, content: h.content }));

    const msg = await claude().messages.create({
      model: MODEL,
      max_tokens: 800,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [...priorTurns, { role: "user", content: userText }],
    });

    const reply = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");

    return NextResponse.json({ reply, demo: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { reply: `⚠️ The tutor had a problem: ${message}. Please try again.`, error: true },
      { status: 200 },
    );
  }
}
