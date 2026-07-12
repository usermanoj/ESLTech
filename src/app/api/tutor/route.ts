import { NextRequest, NextResponse } from "next/server";
import { claude, hasApiKey, MODEL } from "@/lib/claude";
import { buildSystemPrompt, fallbackReply, type Intent, type EslLevel } from "@/lib/tutor";
import { CORPUS } from "@/data/corpus";

export const runtime = "nodejs";

type HistoryTurn = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    const { topicId, intent, question, level, answer, turn, history, contextChunkId } = (await req.json()) as {
      topicId?: string;
      intent: Intent;
      question: string;
      level: EslLevel;
      answer?: string;
      turn?: number;
      history?: HistoryTurn[];
      contextChunkId?: string;
    };
    const turnNum = turn ?? 0;
    const topic = topicId ?? "moments";

    if (!hasApiKey()) {
      const fb = fallbackReply(topic, intent, question, turnNum, contextChunkId);
      return NextResponse.json({ reply: fb.text, demo: true, sourceId: fb.sourceId });
    }

    const system = buildSystemPrompt(topic, level ?? "intermediate", intent ?? "explain", turnNum);

    let userText: string;
    if (intent === "check") {
      const contextChunk = contextChunkId ? CORPUS.find((c) => c.id === contextChunkId) : undefined;
      userText = contextChunk
        ? `The student is working on a problem related to: "${contextChunk.text}" (source: ${contextChunk.source}). ` +
          `Their attempted answer/working: "${answer}". Give a hint about what to check — do not give the final answer.`
        : `The student tapped "Check My Answer" but no specific question has been established in this conversation yet. ` +
          `Their input: "${answer || question}". Do NOT invent or guess a problem — ask them to state or paste the exact ` +
          `question they are solving, then you can check their working once you know it.`;
    } else {
      userText = question || "Please help me understand this topic.";
    }

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
