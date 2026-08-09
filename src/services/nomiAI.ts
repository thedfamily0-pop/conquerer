// ============================================================
// nomiAI.ts — child-safe Nomi chat orchestration.
// Hosted Gemini is the beta default; local replies are offline-only.
// ============================================================

import { checkChildSafety } from './aiTutor';
import type { NomiMessage } from '../data/scheduleData';
import { scanForPromptInjection, INJECTION_RESPONSE } from './guardrails/promptInjectionFilter';
import { scanAIResponse, BLOCKED_RESPONSE_FALLBACK } from './guardrails/responseScanner';
import { checkAIAvailability, recordAIMessage } from './guardrails/rateLimiter';
import { detectPII, detectURLs } from './guardrails/inputScanner';
import { isAIGatewayEnabled, requestAIGateway, type GatewayFailureKind } from './aiGateway';

export { checkChildSafety };

export type NomiChatStatus = 'response' | 'offline' | 'safety' | 'blocked' | 'quota' | 'unavailable' | 'unauthenticated' | 'forbidden';
export interface NomiChatResult { text: string; status: NomiChatStatus; }

const OFFLINE_RESPONSES: Record<string, string[]> = {
  greeting: ['Hi! What would you like to talk about?', 'Hello. What are you curious about today?'],
  howAreYou: ['I’m ready to help with a question, idea, or small challenge. How are you feeling?', 'I’m here. What would you like to explore?'],
  joke: ['Why did the maths book look sad? It had too many problems.', 'What do you call a fish without eyes? A fsh.'],
  maths: ['Try reading the question once, then tell me the numbers and what it is asking you to find.', 'Start with the first small step. Which operation do you think the question needs?'],
  sad: ['That sounds hard. You can tell me what happened, or take a slow breath and talk to a trusted grown-up nearby.'],
  bored: ['Would you rather hear a joke, learn one surprising fact, or try a two-minute word challenge?'],
  schedule: ['Your plan is in the Today tab. Check what is next, then focus on one thing at a time.'],
  bedtime: ['It sounds like a good time to slow down. A short story, some water, and rest can help you feel ready for tomorrow.'],
  xpMilestone: ['Nice work. Your effort is adding up—what would you like to try next?'],
  encouragement: ['Well done for sticking with it. What part felt easiest, and what part was tricky?'],
  default: ['I’m offline right now, so I can only help with simple prompts. Try asking for a joke, a word challenge, or a small maths hint.'],
};

const PRIVACY_RESPONSE = 'Please leave out links and private details, such as names, phone numbers, addresses, or email addresses.';
const URGENT_RESPONSE = 'I’m really glad you told me. Please tell a trusted grown-up near you right now, or call local emergency services if you are in immediate danger.';

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectIntent(msg: string): keyof typeof OFFLINE_RESPONSES {
  const normalized = msg.toLowerCase();
  if (/^(hi|hello|hey|sawu|hola|howzit|morning|afternoon|evening|good day)/.test(normalized)) return 'greeting';
  if (/(how are you|how r u|how's nomi|you okay)/.test(normalized)) return 'howAreYou';
  if (/(joke|funny|laugh|lol|haha)/.test(normalized)) return 'joke';
  if (/(maths|math|sum|plus|minus|times|divide|number|subtract|add)/.test(normalized)) return 'maths';
  if (/(sad|unhappy|cry|upset|lonely|miss|worried|scared|angry|mad)/.test(normalized)) return 'sad';
  if (/(bored|boring|nothing to do|what to do)/.test(normalized)) return 'bored';
  if (/(schedule|today|timetable|next|what time|when|reminder)/.test(normalized)) return 'schedule';
  if (/(sleep|bed|tired|night|dream)/.test(normalized)) return 'bedtime';
  if (/(level|xp|badge|points|earn|reward)/.test(normalized)) return 'xpMilestone';
  if (/(well done|good job|i did it|i finished|completed|i won|correct)/.test(normalized)) return 'encouragement';
  return 'default';
}

function failureStatus(kind: GatewayFailureKind): NomiChatStatus {
  return kind;
}

function historyForGateway(history: NomiMessage[], currentMessage: string) {
  const withoutCurrent = history.at(-1)?.role === 'ufefe' && history.at(-1)?.content === currentMessage
    ? history.slice(0, -1)
    : history;
  return withoutCurrent.slice(-10).map(message => ({
    role: message.role === 'nomi' ? 'model' as const : 'user' as const,
    text: message.content,
  }));
}

/** Uses the authenticated Edge Function in beta; local replies are explicit offline/demo behavior only. */
export async function nomiChat(userMessage: string, history: NomiMessage[]): Promise<NomiChatResult> {
  const injection = scanForPromptInjection(userMessage);
  if (injection.isInjection) return { text: INJECTION_RESPONSE, status: 'blocked' };

  const safety = checkChildSafety(userMessage);
  if (safety.isUrgent) return { text: URGENT_RESPONSE, status: 'safety' };

  if (detectURLs(userMessage).hasURLs || detectPII(userMessage).hasPII) {
    return { text: PRIVACY_RESPONSE, status: 'blocked' };
  }

  if (isAIGatewayEnabled()) {
    const result = await requestAIGateway({
      channel: 'nomi',
      message: userMessage,
      history: historyForGateway(history, userMessage),
    });
    if (!result.ok) return { text: result.message, status: failureStatus(result.kind) };

    const responseScan = scanAIResponse(result.text);
    if (!responseScan.isSafe) return { text: BLOCKED_RESPONSE_FALLBACK, status: 'blocked' };
    return { text: result.text, status: 'response' };
  }

  const availability = checkAIAvailability(undefined, 'nomi');
  if (!availability.allowed) {
    return { text: availability.friendlyMessage || 'Nomi is available again later.', status: 'offline' };
  }
  recordAIMessage('nomi');
  await new Promise(resolve => setTimeout(resolve, 350));
  return { text: pickRandom(OFFLINE_RESPONSES[detectIntent(userMessage)]), status: 'offline' };
}

export function nomiOpeningGreeting(displayName = 'there'): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${displayName}. What would you like to explore?`;
  if (hour < 17) return `Hi, ${displayName}. What is on your mind?`;
  return `Good evening, ${displayName}. What would you like to talk about?`;
}
