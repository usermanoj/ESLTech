import { NextRequest, NextResponse } from "next/server";
import { claude, hasApiKey, MODEL } from "@/lib/claude";
import { GLOSSARY, CORPUS } from "@/data/corpus";
import { ZH_TRANSLATIONS } from "@/data/translations-zh";

export const runtime = "nodejs";

const glossaryLines = Object.entries(GLOSSARY)
  .map(([en, v]) => `- "${en}" → ${v.zh}`)
  .join("\n");

export async function POST(req: NextRequest) {
  try {
    const { text, target, sourceId } = (await req.json()) as {
      text: string;
      target?: string;
      sourceId?: string;
    };
    const lang = target || "Simplified Chinese (简体中文)";

    if (!hasApiKey()) {
      // Demo/offline mode: use a reviewed translation of the ACTUAL chunk that
      // was just explained (sourceId), rather than one generic canned string —
      // so Translate reflects what the student is really looking at.
      const reviewed = sourceId ? ZH_TRANSLATIONS[sourceId] : undefined;
      const chunk = sourceId ? CORPUS.find((c) => c.id === sourceId) : undefined;
      if (reviewed) {
        return NextResponse.json({
          translation: `${reviewed}\n\n📖 Based on: ${chunk?.source ?? "approved material"} (demo mode — reviewed translation)`,
          demo: true,
        });
      }
      return NextResponse.json({
        translation:
          "演示模式：暂无该内容的预先翻译。\n(Demo mode: no pre-reviewed translation for this exact text yet — enable the live AI for a full, accurate translation of anything.)",
        demo: true,
      });
    }

    const msg = await claude().messages.create({
      model: process.env.ANTHROPIC_TRANSLATE_MODEL || MODEL,
      max_tokens: 700,
      system:
        `You are a professional bilingual physics teacher translating study material into ${lang} for a Grade 7 ESL student. ` +
        `Translate faithfully and naturally, keeping the scientific meaning exact. Use this approved terminology glossary for consistency:\n${glossaryLines}\n` +
        `Return ONLY the translation, no preamble.`,
      messages: [{ role: "user", content: text }],
    });

    const translation = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");

    return NextResponse.json({ translation, demo: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ translation: `⚠️ ${message}`, error: true }, { status: 200 });
  }
}
