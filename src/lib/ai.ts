// Model-agnostic AI layer: every call site below routes through the Vercel
// AI Gateway using a plain "provider/model" string, so switching providers
// (Claude, GPT, Gemini, DeepSeek, Qwen, Kimi, ...) is an env var change, not
// a call-site rewrite.
export const MODEL = process.env.AI_MODEL || "anthropic/claude-opus-4.8";
export const TRANSLATE_MODEL = process.env.AI_TRANSLATE_MODEL || MODEL;

export const hasApiKey = () =>
  Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

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
