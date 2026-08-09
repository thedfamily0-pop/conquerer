// ============================================================
// Conversation Manager: Auto-purge with sentiment preservation
// - Cap at 100 messages
// - 30-day TTL
// - Extract & save conversation sentiment summary before purge
// ============================================================

import type { NomiMessage } from '../../data/scheduleData';

const SENTIMENT_STORAGE_KEY = 'explorer_nomi_sentiment_history_v1';

export interface ConversationSentiment {
  id: string;
  period: string; // "2026-07-10 to 2026-07-20"
  messageCount: number;
  topics: string[];
  overallMood: 'positive' | 'neutral' | 'concerned';
  keyLearnings: string[];
  savedAt: string;
}

/** Apply TTL and cap to messages, preserving sentiment summaries */
export function pruneConversation(
  messages: NomiMessage[],
  maxMessages = 100,
  ttlDays = 30
): { pruned: NomiMessage[]; purgedCount: number } {
  const cutoff = new Date(Date.now() - ttlDays * 24 * 60 * 60 * 1000).toISOString();

  // Remove messages older than TTL
  const withinTTL = messages.filter(m => m.timestamp >= cutoff);
  const ttlPurged = messages.length - withinTTL.length;

  // If still over cap, save sentiment then trim oldest
  if (withinTTL.length > maxMessages) {
    const overflow = withinTTL.slice(0, withinTTL.length - maxMessages);
    saveConversationSentiment(overflow);
    const capped = withinTTL.slice(-maxMessages);
    return { pruned: capped, purgedCount: ttlPurged + overflow.length };
  }

  // If TTL purged messages, save their sentiment
  if (ttlPurged > 0) {
    const purged = messages.filter(m => m.timestamp < cutoff);
    saveConversationSentiment(purged);
  }

  return { pruned: withinTTL, purgedCount: ttlPurged };
}

/** Extract lightweight sentiment summary from purged messages */
function saveConversationSentiment(messages: NomiMessage[]): void {
  if (messages.length === 0) return;

  const history = loadSentimentHistory();
  const childMessages = messages.filter(m => m.role === 'ufefe');
  
  if (childMessages.length === 0) return;

  // Extract topics from child messages
  const allText = childMessages.map(m => m.content).join(' ').toLowerCase();
  const topics = extractTopics(allText);

  // Determine overall mood
  const positiveWords = ['happy', 'fun', 'love', 'great', 'cool', 'awesome', 'like', 'enjoy', 'good'];
  const negativeWords = ['sad', 'angry', 'scared', 'worry', 'hate', 'bad', 'boring', 'tired'];
  let pCount = 0, nCount = 0;
  for (const word of allText.split(/\W+/)) {
    if (positiveWords.includes(word)) pCount++;
    if (negativeWords.includes(word)) nCount++;
  }
  const mood: ConversationSentiment['overallMood'] =
    pCount > nCount * 2 ? 'positive' : nCount > pCount ? 'concerned' : 'neutral';

  // Key learnings: unique subjects discussed
  const learnings = extractKeyLearnings(childMessages);

  const timestamps = messages.map(m => m.timestamp).sort();
  const period = `${timestamps[0].slice(0, 10)} to ${timestamps[timestamps.length - 1].slice(0, 10)}`;

  const sentiment: ConversationSentiment = {
    id: `cs_${Date.now()}`,
    period,
    messageCount: messages.length,
    topics: topics.slice(0, 8),
    overallMood: mood,
    keyLearnings: learnings.slice(0, 5),
    savedAt: new Date().toISOString(),
  };

  history.push(sentiment);
  // Keep only last 20 sentiment summaries
  const trimmed = history.slice(-20);
  localStorage.setItem(SENTIMENT_STORAGE_KEY, JSON.stringify(trimmed));
}

function extractTopics(text: string): string[] {
  const topicKeywords: Record<string, string> = {
    'maths|math|number|add|subtract|multiply|divide': 'Mathematics',
    'read|book|story|word': 'Reading',
    'draw|paint|art|colour|color': 'Art & Creativity',
    'game|play|fun|sport': 'Games & Play',
    'friend|school|teacher|class': 'School & Friends',
    'mom|dad|family|sister|brother': 'Family',
    'animal|dog|cat|bird|fish': 'Animals',
    'robot|code|program|computer': 'Coding & Robotics',
    'music|song|dance|sing': 'Music & Dance',
    'food|eat|cook|lunch': 'Food',
  };
  const found: string[] = [];
  for (const [pattern, topic] of Object.entries(topicKeywords)) {
    if (new RegExp(pattern).test(text)) found.push(topic);
  }
  return found;
}

function extractKeyLearnings(messages: NomiMessage[]): string[] {
  const learnings: string[] = [];
  const patterns = [
    { regex: /i learned|i learnt|now i know/i, label: 'Self-reported learning' },
    { regex: /i can now|i figured out|i understand/i, label: 'Achievement/breakthrough' },
    { regex: /my favourite|i love|i like/i, label: 'Preferences shared' },
    { regex: /i'm scared|i'm worried|i feel/i, label: 'Emotional expression' },
    { regex: /help me|how do|what is/i, label: 'Questions asked' },
  ];
  for (const msg of messages) {
    for (const p of patterns) {
      if (p.regex.test(msg.content) && !learnings.includes(p.label)) {
        learnings.push(p.label);
      }
    }
  }
  return learnings;
}

/** Load preserved sentiment history for Nomi context injection */
export function loadSentimentHistory(): ConversationSentiment[] {
  try {
    return JSON.parse(localStorage.getItem(SENTIMENT_STORAGE_KEY) || '[]');
  } catch { return []; }
}

/** Get a context string for Nomi's system prompt from past sentiments */
export function getSentimentContext(): string {
  const history = loadSentimentHistory();
  if (history.length === 0) return '';

  const recent = history.slice(-5);
  const lines = recent.map(s =>
    `[${s.period}] Topics: ${s.topics.join(', ')} | Mood: ${s.overallMood} | ${s.keyLearnings.join(', ')}`
  );
  return `\n\nPast conversation context (memory):\n${lines.join('\n')}`;
}
