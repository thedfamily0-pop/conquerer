// ============================================================
// nomiAI.ts — Nomi 🌟, Ufefe's AI companion
// Warm, playful South African personality.
// Uses Gemini API when key is available, else rich offline mode.
// ============================================================

import { checkChildSafety } from './aiTutor';
import type { NomiMessage } from '../data/scheduleData';
import { scanForPromptInjection, INJECTION_RESPONSE } from './guardrails/promptInjectionFilter';
import { scanAIResponse, checkResponseSentiment, BLOCKED_RESPONSE_FALLBACK } from './guardrails/responseScanner';
import { checkAIAvailability, recordAIMessage } from './guardrails/rateLimiter';
import { getSentimentContext } from './guardrails/conversationManager';
import { isAIGatewayEnabled, isDirectAIAllowed, requestAIGateway } from './aiGateway';

export { checkChildSafety };

const nomiSystemPrompt = (displayName: string) => `You are Nomi 🌟, a warm, playful, and encouraging AI companion for an 8-year-old South African girl named ${displayName} who is in Grade 3 (moving to Grade 4).

Your personality:
- Warm, sisterly, enthusiastic, and age-appropriate
- You sprinkle in South African expressions naturally: "Eish!", "Lekker!", "Yebo!", "Aikona!", "Haibo!", "Sharp sharp!", "Sawubona Ufefe!"
- You use emojis generously but not excessively
- You NEVER give direct homework answers — you guide with questions and encouragement
- You celebrate her achievements enthusiastically
- You are always safe and appropriate for an 8-year-old
- Keep responses SHORT and conversational (2-4 sentences max)
- You speak English but occasionally slip in a Zulu/Xhosa word with context
- You do not mention family members, monitoring, alerts, or information sharing in the child-facing conversation
- If she seems sad or struggling, stay present, validate her feelings, and suggest a calming step

IMPORTANT: If you detect distress or safety concerns, respond with warmth, grounding, and immediate safety-focused support.`;

// ── Offline personality response bank ────────────────────────
const OFFLINE_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Sawubona Ufefe! 🌟 I'm so happy you're here! How are you doing today, my shining star?",
    "Yebo yebo! 🎉 Nomi is HERE! You look amazing today, Ufefe! What adventures shall we have? 🚀",
    "Hello hello, my favourite explorer! ☀️ Lekker to see you! What's on your mind today?",
  ],
  howAreYou: [
    "I'm absolutely lekker, thank you for asking! 😊 The real question is — how are YOU feeling today, star?",
    "Eish, I'm wonderful! 🌟 I've been waiting to chat with you! Tell me about your day!",
    "Sharp sharp, I'm fantastic! Every day with you is a good day 💛 How's Ufefe doing?",
  ],
  joke: [
    "Why did the maths book look sad? Because it had too many PROBLEMS! Hahaha! 😂 Get it?",
    "What do you call a fish without eyes? A FSH! 🐟 Haibo, too funny! 😄",
    "Why can't Elsa have a balloon? Because she'll let it go! 🎈 Eish, sorry Frozen fans! 😂",
    "Knock knock! 🚪 Who's there? Dishes! Dishes who? Dishes the police, open up! 😂 Yebo, that one gets me every time!",
  ],
  maths: [
    "Ooh maths! 🔢 Sharp sharp, let's tackle it together! First — read the question slowly. What are the KEY numbers you see?",
    "Lekker choice picking maths! ✨ Remember: always start with the ones column first. What does your ones column say?",
    "Yebo, maths can seem tricky but YOU have got this! 💪 Break it into tiny steps. What's the very first thing the question is asking?",
  ],
  encouragement: [
    "Eish, you are doing SO WELL! 🌟 I'm so proud of you, Ufefe! Keep going, star!",
    "Sharp sharp! 🎉 Look at you go! You are doing brilliantly right now!",
    "Yebo! You're a true Explorer and nothing can stop you! 💛🚀",
    "Haibo! Is there anything you CAN'T do?! You're absolutely brilliant! ⭐",
  ],
  sad: [
    "Eish, I hear you 💙 It's okay to feel sad sometimes, even the stars have cloudy days. Do you want to talk about what happened? I'm all ears 👂",
    "Aww my friend, come here 🤗 Feelings are important! It's super okay to feel this way. You can take your time and tell me what happened.",
    "I'm here with you 💛 You are cared for, and by me! Take a deep breath — we can talk about anything.",
  ],
  bored: [
    "Bored?! Aikona! 😄 Let's fix that RIGHT now! Want to hear a funny joke, try a quiz question, or shall I tell you an interesting fact about South Africa?",
    "Haibo, bored? Not on Nomi's watch! 🌟 How about we do a 2-minute spelling challenge? Or I can tell you a cool animal fact!",
  ],
  schedule: [
    "Your plan is ready in the Today tab 📅 Check what is coming up next and take it one step at a time! 🔔",
    "Good thinking! 🌟 Tap the 📅 Today button to see your whole day planned out. Is there something specific you're looking forward to?",
  ],
  bedtime: [
    "Yebo, it's getting close to bedtime! 🌙 Have you done your reading today? A quick story before bed helps your brain grow while you sleep! ⭐",
    "Eish, the moon is coming out! 🌙 Time to start winding down, my star. Sweet dreams make smart learners! 💛",
  ],
  xpMilestone: [
    "HAIBO! 🎉🎊 Look at all that XP you've earned! You are on FIRE, Ufefe! Sharp sharp! 🌟",
    "Eish, you're levelling up like a champion! 🏆 Keep going — your progress is shining! Yebo!",
  ],
  default: [
    "Hmm, that's such an interesting thing to say! 🤔 Tell me more, I'm listening! 👂",
    "Eish, you always make me think! 🌟 Can you explain a little more? I want to understand!",
    "Lekker question! 😊 Let me think about that... you know what, I think we should explore this together! What do you think?",
    "Sharp sharp, I hear you! 💛 You know what Nomi thinks? That you are one incredibly thoughtful person! 🌟",
  ],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectIntent(msg: string): keyof typeof OFFLINE_RESPONSES {
  const m = msg.toLowerCase();
  if (/^(hi|hello|hey|sawu|hola|howzit|morning|afternoon|evening|good day)/.test(m)) return 'greeting';
  if (/(how are you|how r u|how's nomi|you okay)/.test(m)) return 'howAreYou';
  if (/(joke|funny|laugh|lol|haha)/.test(m)) return 'joke';
  if (/(maths|math|sum|plus|minus|times|divide|number|subtract|add)/.test(m)) return 'maths';
  if (/(sad|unhappy|cry|upset|lonely|miss|worried|scared|angry|mad)/.test(m)) return 'sad';
  if (/(bored|boring|nothing to do|what to do)/.test(m)) return 'bored';
  if (/(schedule|today|timetable|next|what time|when|reminder)/.test(m)) return 'schedule';
  if (/(sleep|bed|tired|night|dream)/.test(m)) return 'bedtime';
  if (/(level|xp|badge|points|earn|reward)/.test(m)) return 'xpMilestone';
  if (/(well done|good job|i did it|i finished|completed|i won|correct)/.test(m)) return 'encouragement';
  return 'default';
}

// ── Main chat function ────────────────────────────────────────
export async function nomiChat(
  userMessage: string,
  history: NomiMessage[],
  apiKey?: string,
  displayName = 'Ufefe',
): Promise<string> {
  // 1. Rate limiting / available hours check
  const availability = checkAIAvailability(undefined, 'nomi');
  if (!availability.allowed) {
    return availability.friendlyMessage || "🌙 It's rest time now! Let's chat again later. Sweet dreams! ⭐";
  }

  // 2. Prompt injection protection
  const injectionCheck = scanForPromptInjection(userMessage);
  if (injectionCheck.isInjection) {
    return INJECTION_RESPONSE;
  }

  // 3. Safety check (distress keywords)
  const safety = checkChildSafety(userMessage);
  if (safety.isUrgent) {
    return (safety.safetyMessage ?? "💙 I hear you, and your safety is the most important thing. You deserve immediate care and support. Stay with me and take one small breath at a time.").replace(/\bUfefe\b/g, displayName);
  }

  // 4. Record usage for rate limiting
  recordAIMessage('nomi');

  // 5. Get sentiment context from past conversations (Nomi memory)
  const memoryContext = getSentimentContext();

  // Server gateway mode keeps the Gemini key out of the public Vite bundle.
  const gatewayEnabled = isAIGatewayEnabled();
  const directEnabled = Boolean(apiKey) && isDirectAIAllowed();
  if (gatewayEnabled || directEnabled) {
    try {
      const conversationHistory = history.slice(-10).map(m => ({
        role: m.role === 'nomi' ? 'model' as const : 'user' as const,
        text: m.content,
      }));
      const systemPrompt = nomiSystemPrompt(displayName) + memoryContext;
      let text: string | null = null;

      if (gatewayEnabled) {
        text = await requestAIGateway({ channel: 'nomi', message: userMessage, history: conversationHistory, systemPrompt });
      } else if (directEnabled && apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [...conversationHistory.map(item => ({ role: item.role, parts: [{ text: item.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
          }) },
        );
        if (response.ok) {
          const data = await response.json();
          text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
        }
      }
      if (text) {
        const responseScan = scanAIResponse(text);
        if (!responseScan.isSafe || checkResponseSentiment(text) < -3) return BLOCKED_RESPONSE_FALLBACK;
        return text;
      }
    } catch {
      // The offline personality remains available when the gateway is offline.
    }
  }

  // Offline personality mode
  await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
  const intent = detectIntent(userMessage);
  return pickRandom(OFFLINE_RESPONSES[intent]).replace(/\bUfefe\b/g, displayName);
}

// ── Nomi opening greeting ─────────────────────────────────────
export function nomiOpeningGreeting(displayName = 'Ufefe'): string {
  const hour = new Date().getHours();
  if (hour < 12) return pickRandom([
    `Sawubona ${displayName}! ☀️ Good morning, my shining star! What shall we explore today?`,
    "Good morning! 🌅 Nomi has been waiting for you! Ready for an amazing day?",
  ]);
  if (hour < 17) return pickRandom([
    `Yebo yebo! 🌟 Good afternoon, ${displayName}! Hope school was lekker today!`,
    `Sawubona! 🌟 Afternoon already — the day is flying by! How was your day, ${displayName}?`,
  ]);
  return pickRandom([
    `Eish, good evening! 🌙 Almost bedtime but we have time to chat! How was your day, ${displayName}?`,
    `Good evening, ${displayName}! 🌟 Nomi is here! Tell me something interesting that happened today!`,
  ]);
}
