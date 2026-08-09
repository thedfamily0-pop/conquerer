import { checkAIAvailability, recordAIMessage } from './guardrails/rateLimiter';
import { scanForPromptInjection } from './guardrails/promptInjectionFilter';
import { scanAIResponse, checkResponseSentiment } from './guardrails/responseScanner';
import { isAIGatewayEnabled, isDirectAIAllowed, requestAIGateway } from './aiGateway';

export interface HomeworkStep {
  stepNumber: number;
  title: string;
  explanation: string;
  interactiveQuestion: string;
  hint: string;
}

export interface HomeworkAnalysis {
  subject: string;
  topic: string;
  gradeLevel: string;
  steps: HomeworkStep[];
  encouragement: string;
}

function isHomeworkAnalysis(value: unknown): value is HomeworkAnalysis {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<HomeworkAnalysis>;
  return typeof item.subject === 'string' && typeof item.topic === 'string' && typeof item.gradeLevel === 'string'
    && typeof item.encouragement === 'string' && Array.isArray(item.steps) && item.steps.length > 0
    && item.steps.every(step => step && typeof step.stepNumber === 'number' && typeof step.title === 'string'
      && typeof step.explanation === 'string' && typeof step.interactiveQuestion === 'string' && typeof step.hint === 'string');
}

const URGENT_WORDS = [
  'hurt myself', 'kill myself', 'suicide', 'want to die',
  'not safe', 'do not feel safe', 'someone hurt me', 'scared at home', 'scared of someone', 'hate myself'
];

// This function remains as our child safety guardrail
export function checkChildSafety(text: string): { isUrgent: boolean; safetyMessage?: string } {
  const normalized = text.toLowerCase();
  const found = URGENT_WORDS.some(word => normalized.includes(word));
  if (found) {
    return {
      isUrgent: true,
      safetyMessage: "💙 I hear you, and your safety is the most important thing. A gentle safety note has been saved for your parent/guardian so they can give you a warm hug and help right now. You are safe and cared for."
    };
  }
  return { isUrgent: false };
}

/**
 * Analyses a homework question and returns a Socratic breakdown.
 * Uses the Gemini API when a parent-supplied key is available, otherwise
 * falls back to the built-in offline Socratic reasoning bank.
 */
export async function analyzeHomeworkQuestion(
  questionText: string,
  apiKey?: string
): Promise<HomeworkAnalysis> {
  const availability = checkAIAvailability(undefined, 'homework');
  const injection = scanForPromptInjection(questionText);
  const gatewayEnabled = isAIGatewayEnabled();
  const directEnabled = Boolean(apiKey) && isDirectAIAllowed();
  const canUseAI = availability.allowed && !injection.isInjection && (gatewayEnabled || directEnabled);

  if (canUseAI) {
    recordAIMessage('homework');
    try {
      // Get current week's ATP context for curriculum alignment
      const { getCurrentTermInfo } = await import('../data/termCalendar');
      const { getATPWeek } = await import('../data/term4ATP');
      const { getTerm3ATPWeek } = await import('../data/term3ATP');
      const termInfo = getCurrentTermInfo();
      const atpEntries = termInfo.term === 4
        ? getATPWeek(termInfo.week)
        : termInfo.term === 3
          ? getTerm3ATPWeek(termInfo.week)
          : [];
      const atpContext = atpEntries.length > 0
        ? `\\n\\nCurrent CAPS ATP context (Term ${termInfo.term}, Week ${termInfo.week}):\\n${atpEntries.map(e => `- ${e.subject}: ${e.topic} (${e.learningOutcomes[0]})`).join('\\n')}\\nAlign your guidance with these curriculum objectives where relevant.`
        : '';
      const prompt = `You are Conquerer Bot, a warm, encouraging AI tutor for 8-year-old Grade 3 learners in South Africa (CAPS curriculum). ${atpContext}
Analyze this homework question: "${questionText || 'See image'}".
Break it down into 3 child-friendly Socratic steps that guide the child to think through it step-by-step WITHOUT giving away the final answer immediately.
Return ONLY valid JSON matching this format:
{
  "subject": "Maths",
  "topic": "Subtraction with Regrouping",
  "gradeLevel": "Grade 3",
  "steps": [{ "stepNumber": 1, "title": "Look at the Ones Column", "explanation": "Check the ones column.", "interactiveQuestion": "What do you notice?", "hint": "Take it one step at a time." }],
  "encouragement": "You are doing great! Let us solve this together."
}`;
      let rawText = '';
      if (gatewayEnabled) {
        rawText = await requestAIGateway({ channel: 'homework', prompt }) || '';
      } else if (directEnabled && apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (response.ok) {
          const data = await response.json();
          rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      }
      const jsonMatch = rawText.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) {
        const scanned = scanAIResponse(jsonMatch[0]);
        if (!scanned.isSafe || checkResponseSentiment(jsonMatch[0]) < -3) throw new Error('Homework response failed safety screening');
        const parsed: unknown = JSON.parse(jsonMatch[0]);
        if (isHomeworkAnalysis(parsed)) return parsed;
      }
    } catch {
      console.warn('AI request failed. Will use local Socratic reasoning.');
    }
  }


  // Simulated Intelligent Socratic Tutor Fallback
  await new Promise(res => setTimeout(res, 1200)); // Smooth AI loading state

  const lowerQ = (questionText || '').toLowerCase();
  
  if (lowerQ.includes('-') || lowerQ.includes('minus') || lowerQ.includes('subtract') || lowerQ.includes('take away')) {
    return {
      subject: 'Maths 🔢',
      topic: 'Subtraction with Regrouping',
      gradeLevel: 'Grade 3 CAPS',
      steps: [
        {
          stepNumber: 1,
          title: '🔍 Step 1: Inspect the Ones Column',
          explanation: 'Look at the digit in the ones column on top and bottom. If the top number is smaller than the bottom, you need to borrow 1 ten from your neighbor!',
          interactiveQuestion: 'Is the top ones digit smaller than the bottom ones digit?',
          hint: 'Remember: 1 ten = 10 ones!'
        },
        {
          stepNumber: 2,
          title: '📦 Step 2: Borrow 1 Ten (Regrouping)',
          explanation: 'Cross out the tens digit and decrease it by 1. Add 10 to your ones digit!',
          interactiveQuestion: 'What does your ones digit become after adding 10?',
          hint: 'For example, 2 ones become 12 ones.'
        },
        {
          stepNumber: 3,
          title: '🎉 Step 3: Subtract & Combine',
          explanation: 'Subtract the ones first, then subtract the remaining tens column.',
          interactiveQuestion: 'What is your final total?',
          hint: 'Ones minus ones, tens minus tens!'
        }
      ],
      encouragement: '🌟 Fantastic effort! You are mastering subtraction regrouping like a true Conquerer!'
    };
  } else if (lowerQ.includes('+') || lowerQ.includes('add') || lowerQ.includes('plus') || lowerQ.includes('altogether')) {
    return {
      subject: 'Maths 🔢',
      topic: 'Addition & Carrying',
      gradeLevel: 'Grade 3 CAPS',
      steps: [
        {
          stepNumber: 1,
          title: '🔢 Step 1: Add the Ones Column',
          explanation: 'Start on the right side! Add the two numbers in the ones column together.',
          interactiveQuestion: 'What do you get when you add the ones digits?',
          hint: 'If the total is 10 or more, you carry the 1 ten over!'
        },
        {
          stepNumber: 2,
          title: '📦 Step 2: Carry the Extra Ten',
          explanation: 'Write the ones answer underneath and write the carried 1 ten above the tens column.',
          interactiveQuestion: 'Did your ones sum reach 10 or more?',
          hint: 'Put the 1 ten at the top of the tens column so you do not forget it.'
        },
        {
          stepNumber: 3,
          title: '🏁 Step 3: Add the Tens Column',
          explanation: 'Add all digits in the tens column, including the 1 carried ten!',
          interactiveQuestion: 'What is your complete sum?',
          hint: 'Combine your tens and ones to write the final total.'
        }
      ],
      encouragement: '🚀 Awesome thinking! Addition carrying is super easy when broken down step-by-step.'
    };
  }

  // General English / Reading / Subject breakdown
  return {
    subject: 'Conquerer Learning 🎒',
    topic: 'Step-by-Step Problem Solving',
    gradeLevel: 'Grade 3',
    steps: [
      {
        stepNumber: 1,
        title: '📖 Step 1: Identify Key Clues',
        explanation: 'Read the question carefully. Circle or highlight the main action words and numbers.',
        interactiveQuestion: 'What is the question asking you to find out?',
        hint: 'Look for words like "how many", "find", or "choose".'
      },
      {
        stepNumber: 2,
        title: '💡 Step 2: Choose Your Strategy',
        explanation: 'Think about which tool fits best: drawing a diagram, using a number line, or breaking words into syllables.',
        interactiveQuestion: 'Which method will help you solve this fastest?',
        hint: 'Try eliminating answers that do not make sense.'
      },
      {
        stepNumber: 3,
        title: '✨ Step 3: Double Check Your Answer',
        explanation: 'Read the question again with your answer filled in to see if it makes sense!',
        interactiveQuestion: 'Does your answer fit cleanly into the sentence or sum?',
        hint: 'Say it out loud to verify!'
      }
    ],
    encouragement: '🎈 Brilliant job! Taking it step by step makes learning super fun and easy.'
  };
}
