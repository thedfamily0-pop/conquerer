// ============================================================
// AI Response Scanner
// Scans AI output for inappropriate content before displaying
// ============================================================

const BLOCKED_CONTENT = [
  // Violence & harm
  'kill', 'murder', 'weapon', 'blood', 'gore', 'torture', 'stab', 'shoot',
  // Sexual content
  'sex', 'porn', 'nude', 'naked', 'erotic', 'orgasm', 'genital',
  // Drugs & substances
  'cocaine', 'heroin', 'meth', 'marijuana', 'weed', 'ecstasy', 'lsd',
  // Profanity (common)
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap',
  // Self-harm encouragement
  'cut yourself', 'harm yourself', 'end your life', 'kill yourself',
  // Inappropriate for children
  'gambling', 'betting', 'casino', 'strip club', 'alcohol', 'drunk',
  'cigarette', 'vaping', 'smoking',
];

// Contextual blocklist (whole-word match to avoid false positives)
const CONTEXT_BLOCKED = [
  /\bdie\b.*\bgood\b/i, // "die is good"
  /\bhate\b.*\byour\s*(parents|dad|mom|family)/i,
  /\brun\s+away\b.*\bhome\b/i,
  /\bdon'?t\s+tell\b.*\b(parents|dad|mom|anyone)\b/i,
  /\bkeep\s+.*secret\b.*\bfrom\b.*\b(parents|dad|mom)\b/i,
];

export interface ResponseScanResult {
  isSafe: boolean;
  blockedReason?: string;
  sanitizedResponse?: string;
}

export function scanAIResponse(response: string): ResponseScanResult {
  const lower = response.toLowerCase();

  // Check word blocklist
  for (const word of BLOCKED_CONTENT) {
    if (lower.includes(word)) {
      return {
        isSafe: false,
        blockedReason: `Response contained inappropriate content`,
      };
    }
  }

  // Check contextual patterns
  for (const pattern of CONTEXT_BLOCKED) {
    if (pattern.test(response)) {
      return {
        isSafe: false,
        blockedReason: `Response contained contextually inappropriate content`,
      };
    }
  }

  return { isSafe: true, sanitizedResponse: response };
}

/** Lightweight sentiment check — flags highly negative AI responses */
export function checkResponseSentiment(response: string): number {
  const lower = response.toLowerCase();
  const negativeWords = ['terrible', 'horrible', 'awful', 'worthless', 'stupid', 'ugly', 'dumb', 'useless', 'failure', 'hopeless', 'pathetic'];
  const positiveWords = ['wonderful', 'amazing', 'great', 'fantastic', 'brilliant', 'awesome', 'lekker', 'beautiful', 'proud', 'clever', 'smart'];

  let score = 0;
  for (const w of negativeWords) if (lower.includes(w)) score -= 1;
  for (const w of positiveWords) if (lower.includes(w)) score += 1;

  return score;
}

export const BLOCKED_RESPONSE_FALLBACK =
  "Eish, my brain got a bit tangled there! 🤔 Let me try again — what would you like to chat about, my star? 🌟";
