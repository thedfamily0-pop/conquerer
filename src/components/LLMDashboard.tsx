import { useState } from 'react';
import { Key, Loader2, Send, Sparkles } from 'lucide-react';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getWeekTheme } from '../data/termData';
import { checkAIAvailability, recordAIMessage } from '../services/guardrails/rateLimiter';
import { isAIGatewayEnabled, isDirectAIAllowed, requestAIGateway } from '../services/aiGateway';

type Provider = 'gemini' | 'openai' | 'claude';
interface Props { xp: number; level: number; streak: number; choresCompleted: number; totalChores: number; diaryCount: number; provider: Provider; apiKey: string; onConfigChange: (provider: Provider, apiKey: string) => void; }

async function queryLLM(provider: Provider, apiKey: string, prompt: string): Promise<string> {
  const gatewayEnabled = provider === 'gemini' && isAIGatewayEnabled();
  if (!apiKey && !gatewayEnabled) return 'AI is not configured. A parent can enable the secure Gemini gateway or add a development key.';
  const availability = checkAIAvailability(undefined, 'parent');
  if (!availability.allowed) return availability.friendlyMessage || 'The AI request limit has been reached.';
  recordAIMessage('parent');
  try {
    if (gatewayEnabled) return await requestAIGateway({ channel: 'parent', prompt }) || 'No response from Gemini.';
    if (!isDirectAIAllowed()) return 'Direct browser AI is disabled. Enable the secure Gemini gateway for production use.';
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 600, temperature: 0.7 } }) });
      if (!res.ok) return 'Gemini is temporarily unavailable.';
      const data = await res.json(); return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 600 }) });
      if (!res.ok) return 'OpenAI is temporarily unavailable.';
      const data = await res.json(); return data.choices?.[0]?.message?.content || 'No response from OpenAI.';
    } else {
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }) });
      if (!res.ok) return 'Claude is temporarily unavailable.';
      const data = await res.json(); return data.content?.[0]?.text || 'No response from Claude.';
    }
  } catch (err) { return `Error: ${err instanceof Error ? err.message : 'Request failed'}`; }
}

export function LLMDashboard({ xp, level, streak, choresCompleted, totalChores, diaryCount, provider, apiKey, onConfigChange }: Props) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const termInfo = getCurrentTermInfo();
  const weekTheme = !termInfo.isHoliday ? getWeekTheme(termInfo.term, termInfo.week) : undefined;
  const themeContext = weekTheme ? `\n- This week's Life Skills theme: "${weekTheme.theme}" (${weekTheme.subjects.join(', ')})\n- Weekly objectives: ${weekTheme.objectives.join('; ')}\n- IMPORTANT: The Life Skills theme is the CREATIVE LENS for ALL subjects this week. Maths problems should use ${weekTheme.theme.toLowerCase()}-related contexts. English/reading should connect to the theme. All recommendations should be themed around "${weekTheme.theme}".` : '';

  const contextPrompt = `You are an AI assistant helping a parent monitor and optimise their 8-year-old South African child's learning app (Conquerer). The app follows the CAPS Grade 3 curriculum with themed weekly content.

Current state:
- XP earned: ${xp}
- Level: ${level}
- Streak: ${streak} days
- Chores completed: ${choresCompleted}/${totalChores}
- Diary entries: ${diaryCount}
- Term ${termInfo.term}, Week ${termInfo.week}${themeContext}

THEMATIC APPROACH: The Life Skills theme for the week serves as the creative wrapper for ALL subjects. Maths questions use themed contexts, stories connect to the theme, Afrikaans vocab relates to it, etc. This makes learning feel cohesive and fun.

The parent asks: "${query}"

Give a helpful, concise response. When suggesting content, chores, or activities, always align them with this week's theme.`;

  const ask = async () => { if (!query.trim()) return; setLoading(true); setResponse(''); const answer = await queryLLM(provider, apiKey, contextPrompt); setResponse(answer); setLoading(false); };

  const quickPrompts = [
    'What subjects should we focus on this week?',
    'Suggest 3 new chores with XP values',
    'Analyse the learning pattern and give recommendations',
    'Is the XP balance healthy for motivation?',
  ];

  return (
    <section className="llm-dashboard">
      <div className="llm-config">
        <h4><Key size={16}/> Secure AI connection</h4>
        <p className="muted">Gemini can run through the protected family gateway. Development-only provider keys stay in this browser and are never suitable for a live deployment.</p>
        <div className="llm-config-row">
          <select value={provider} onChange={e => onConfigChange(e.target.value as Provider, apiKey)} title="AI Provider">
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="claude">Anthropic Claude</option>
          </select>
          <div className="key-input-row">
            <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => onConfigChange(provider, e.target.value)} placeholder="Paste your API key here" title="LLM API key"/>
            <button type="button" className="text-button" onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Show'}</button>
          </div>
        </div>
      </div>

      <div className="llm-chat">
        <h4><Sparkles size={16}/> Ask your AI assistant</h4>
        <div className="llm-quick-prompts">
          {quickPrompts.map(p => <button key={p} onClick={() => { setQuery(p); }}>{p}</button>)}
        </div>
        <div className="llm-input-row">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask about learning patterns, schedule ideas, or app improvements…" onKeyDown={e => e.key === 'Enter' && ask()} title="Your question"/>
          <button className="btn-primary" onClick={ask} disabled={loading || !query.trim() || (!apiKey && !(provider === 'gemini' && isAIGatewayEnabled()))} title="Send to AI">
            {loading ? <Loader2 size={17} className="spin"/> : <Send size={17}/>}
          </button>
        </div>
        {response && (
          <div className="llm-response">
            <div className="llm-response-header"><Sparkles size={15}/><span>{provider === 'gemini' ? 'Gemini' : provider === 'openai' ? 'GPT' : 'Claude'} says:</span></div>
            <p>{response}</p>
          </div>
        )}
      </div>
    </section>
  );
}
