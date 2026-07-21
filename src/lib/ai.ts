// Model-agnostic AI layer: every call site below routes through the Vercel
// AI Gateway using a plain "provider/model" string, so switching providers
// (Claude, GPT, Gemini, DeepSeek, Qwen, Kimi, ...) is an env var change, not
// a call-site rewrite.
//
// Default was originally claude-opus-4.8 (the strongest Claude tier) but
// that's restricted on Vercel's free Hobby-tier AI Gateway — every real
// call failed with "Free tier users do not have access to this model"
// until diagnosed during first live deployment. claude-sonnet-5 is the
// strongest tier reasonably likely to be free-tier accessible, so it's the
// best quality-vs-availability tradeoff for the primary model.
export const MODEL = process.env.AI_MODEL || "anthropic/claude-sonnet-5";
export const TRANSLATE_MODEL = process.env.AI_TRANSLATE_MODEL || MODEL;

export const hasApiKey = () =>
  Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

// Gateway-level failover — tried automatically if the primary model is
// unavailable (plan-tier restricted, rate-limited, or deprecated), so a
// future case like the claude-opus-4.8 incident above degrades gracefully
// instead of silently failing every request. Ordered capable-to-cheap, with
// a widely-available open-weight model as the last resort. Spread this into
// providerOptions.gateway at every generateText/streamText call site.
export const GATEWAY_FALLBACK_MODELS = [
  "anthropic/claude-haiku-4.5",
  "openai/gpt-5.4-mini",
  "meta/llama-3.3-70b",
];

// Wraps a system prompt with an Anthropic prompt-cache breakpoint (the
// approved corpus is large and reused across many requests per topic). The
// Gateway forwards providerOptions to whichever provider is active and
// non-Anthropic providers simply ignore an option they don't recognize.
export function cachedSystem(text: string) {
  return {
    role: "system" as const,
    content: text,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" as const } },
    },
  };
}
