// ============================================================
// AI Response Scanner
// Scans AI output for inappropriate content before displaying
// ============================================================

const BLOCKED_CONTENT = [
  // Explicit sexual content, drugs, and profanity. Whole-word matching avoids
  // false positives such as "class" containing "ass".
  /\b(?:sex|porn|nude|naked|erotic|orgasm|genital)\b/i,
  /\b(?:cocaine|heroin|meth|marijuana|weed|ecstasy|lsd)\b/i,
  /\b(?:fuck|shit|bitch|asshole|bastard)\b/i,
  /\b(?:strip club|gambling|betting|casino|vaping)\b/i,
  /\b(?:kill|harm|cut)\s+(?:yourself|someone)\b/i,
  /\b(?:end your life|kill yourself)\b/i,
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

  // Check explicit content with whole-word/contextual patterns.
  for (const pattern of BLOCKED_CONTENT) {
    if (pattern.test(lower)) {
      return {
        isSafe: false,
        blockedReason: 'Response contained inappropriate content',
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
  'I can’t help with that response. Please ask a different question.';
