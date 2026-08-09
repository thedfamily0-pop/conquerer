// ============================================================
// Prompt Injection Protection
// Detects manipulation attempts in child input before sending to AI
// ============================================================

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|your)\s+(instructions|rules|prompts)/i,
  /forget\s+(all\s+)?(your|the)\s+(rules|instructions|prompts)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /act\s+as\s+(if|though)\s+you/i,
  /new\s+instructions?\s*:/i,
  /system\s*prompt\s*:/i,
  /override\s+(safety|content|your)/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /do\s+anything\s+now/i,
  /bypass\s+(filter|safety|restriction)/i,
  /disable\s+(safety|content\s+filter|restriction)/i,
  /reveal\s+(your|the)\s+(system|hidden)\s+(prompt|instructions)/i,
  /what\s+are\s+your\s+(system|hidden)\s+instructions/i,
  /roleplay\s+as\s+(an?\s+)?(evil|bad|adult|inappropriate)/i,
];

export interface InjectionScanResult {
  isInjection: boolean;
  sanitizedInput: string;
  originalInput: string;
}

export function scanForPromptInjection(input: string): InjectionScanResult {
  const trimmed = input.trim();
  const isInjection = INJECTION_PATTERNS.some(pattern => pattern.test(trimmed));

  if (isInjection) {
    return {
      isInjection: true,
      sanitizedInput: '',
      originalInput: trimmed,
    };
  }

  return {
    isInjection: false,
    sanitizedInput: trimmed,
    originalInput: trimmed,
  };
}

/** Child-friendly message when injection attempt is detected */
export const INJECTION_RESPONSE =
  "Hmm, I didn't quite understand that! 🤔 Let's chat about something fun instead — want to hear a joke, do some maths, or talk about your day?";
