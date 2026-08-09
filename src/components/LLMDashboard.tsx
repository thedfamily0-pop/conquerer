import { useEffect, useState } from 'react';
import { Key, Loader2, Save, Send, Sparkles } from 'lucide-react';
import { getCurrentTermInfo } from '../data/termCalendar';
import { getWeekTheme } from '../data/termData';
import { getTerm3ATPWeek } from '../data/term3ATP';
import { getATPWeek } from '../data/term4ATP';
import { isAIGatewayEnabled, requestAIGateway } from '../services/aiGateway';
import { getFamilyLlmSettings, saveFamilyLlmSettings, type FamilyLlmProvider, type FamilyLlmSettings } from '../services/familyLlmSettings';

interface Props {
  xp: number;
  level: number;
  streak: number;
  choresCompleted: number;
  totalChores: number;
  diaryCount: number;
}

function providerLabel(provider: FamilyLlmProvider): string {
  return provider === 'gemini' ? 'Gemini' : provider === 'openai' ? 'OpenAI' : 'Claude';
}

export function LLMDashboard({ xp, level, streak, choresCompleted, totalChores, diaryCount }: Props) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<FamilyLlmSettings | null>(null);
  const [provider, setProvider] = useState<FamilyLlmProvider>('gemini');
  const [model, setModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState('');
  const [settingsBusy, setSettingsBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getFamilyLlmSettings().then(result => {
      if (!active) return;
      if (!result.ok || !result.settings) {
        setSettingsStatus(result.error || 'Hosted LLM settings could not be loaded.');
        return;
      }
      setSettings(result.settings);
      setProvider(result.settings.provider);
      setModel(result.settings.model);
      setSystemPrompt(result.settings.systemPrompt);
    });
    return () => { active = false; };
  }, []);

  const saveSettings = async () => {
    setSettingsBusy(true);
    setSettingsStatus('Saving protected LLM settings…');
    const result = await saveFamilyLlmSettings({ provider, model, systemPrompt, apiKey: apiKey || undefined });
    setSettingsBusy(false);
    if (!result.ok || !result.settings) {
      setSettingsStatus(result.error || 'LLM settings could not be saved.');
      return;
    }
    setSettings(result.settings);
    setProvider(result.settings.provider);
    setModel(result.settings.model);
    setSystemPrompt(result.settings.systemPrompt);
    setApiKey('');
    setSettingsStatus('Settings saved. Provider keys are stored only in protected server storage.');
  };

  const termInfo = getCurrentTermInfo();
  const weekTheme = !termInfo.isHoliday ? getWeekTheme(termInfo.term, termInfo.week) : undefined;
  const atpEntries = termInfo.term === 3 ? getTerm3ATPWeek(termInfo.week) : termInfo.term === 4 ? getATPWeek(termInfo.week) : [];
  const atpContext = atpEntries.length
    ? atpEntries.map(entry => `- ${entry.subject}: ${entry.topic}. Outcomes: ${entry.learningOutcomes.join('; ')}`).join('\n')
    : '- Current-week ATP outcomes are unavailable in this build; ask the parent to verify outcomes before importing content.';
  const themeContext = weekTheme ? `\n- This week's Life Skills theme: "${weekTheme.theme}" (${weekTheme.subjects.join(', ')})\n- Weekly objectives: ${weekTheme.objectives.join('; ')}\n- IMPORTANT: The Life Skills theme is the CREATIVE LENS for ALL subjects this week. Maths problems should use ${weekTheme.theme.toLowerCase()}-related contexts. English/reading should connect to the theme. All recommendations should be themed around "${weekTheme.theme}".` : '';
  const asksForContentResearch = /content research|content import|research brief|weekly content plan/i.test(query);
  const contentResearchDirective = asksForContentResearch ? `

WEEKLY CONTENT RESEARCH BRIEF MODE
Create a parent-reviewable research brief, not invented final sources. Use the ATP outcomes below to say exactly what to research and import.

Required allocation by estimated learning time across the whole pack:
- 60% CORE: this week's standard CAPS/ATP outcomes.
- 35% OPPORTUNITY: consolidate the child's lower-confidence or lower-score subjects before extension work.
- 5% STRETCH: creative, outside-the-box challenge only after the core objective is secure.

For each proposed item give: allocation, subject, exact ATP outcome, a child-friendly concept, an exact web/library research query, an exact YouTube search query, recommended duration, and the importable content shape. Rotate multiple-choice, missing-fields, question-and-answer, connecting-fields, reading/vocabulary, practical/movement, and guided-video practice. For each format provide its import data: multiple-choice uses options/correctIndex; missing-fields and question-and-answer use acceptedAnswers; connecting-fields uses matchingPairs. Do not invent unavailable sources or video URLs.

Every planned practice question or learning activity needs a teaching-video plan. Never invent or guess a YouTube URL. Provide a YouTube search query and mark it “parent review required”. If no suitable YouTube video is found, give a precise one-to-two-minute child-safe cartoon, graphical, infographic, or Notebook-style visual-video production brief; it must be created, reviewed, and published by a parent before embedding.

Finish with a compact JSON-ready import checklist using weeklyResearchBrief, practiceQuestions, stories, weeklyObjectives, and vocab, matching the downloaded Conquerer template.

CURRENT WEEK'S CAPS/ATP OUTCOMES:
${atpContext}` : '';

  const contextPrompt = `You are an AI assistant helping a parent monitor and optimise their 8-year-old South African child's learning app (Conquerer). The app follows the CAPS Grade 3 curriculum with themed weekly content.

Current state:
- XP earned: ${xp}
- Level: ${level}
- Streak: ${streak} days
- Chores completed: ${choresCompleted}/${totalChores}
- Diary entries: ${diaryCount}
- Term ${termInfo.term}, Week ${termInfo.week}${themeContext}${contentResearchDirective}

THEMATIC APPROACH: The Life Skills theme for the week serves as the creative wrapper for ALL subjects. Maths questions use themed contexts, stories connect to the theme, Afrikaans vocab relates to it, etc. This makes learning feel cohesive and fun.

The parent asks: "${query}"

Give a helpful, concise response. When suggesting content, chores, or activities, always align them with this week's theme.`;

  const ask = async () => {
    if (!query.trim()) return;
    if (!isAIGatewayEnabled()) {
      setResponse('The protected hosted AI gateway is unavailable in this build.');
      return;
    }
    setLoading(true);
    setResponse('');
    const result = await requestAIGateway({ channel: 'parent', prompt: contextPrompt });
    setResponse(result.ok ? result.text : result.message);
    setLoading(false);
  };

  const quickPrompts = [
    "Create this week's CAPS content research brief and JSON import checklist",
    'What subjects should we focus on this week?',
    'Suggest 3 new chores with XP values',
    'Analyse the learning pattern and give recommendations',
    'Is the XP balance healthy for motivation?',
  ];
  const requiresKey = provider !== 'gemini' && !settings?.apiKeyConfigured;

  return (
    <section className="llm-dashboard">
      <div className="llm-config">
        <h4><Key size={16}/> Protected AI connection</h4>
        <p className="muted">Gemini is the default. You can choose Gemini, OpenAI, or Claude and set Nomi’s family style below. A key is submitted once to protected server storage, never saved in this browser or shown to the child.</p>
        <div className="llm-config-row">
          <select value={provider} onChange={event => setProvider(event.target.value as FamilyLlmProvider)} title="AI Provider" disabled={settingsBusy}>
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="claude">Anthropic Claude</option>
          </select>
          <input value={model} onChange={event => setModel(event.target.value)} maxLength={100} placeholder="Optional model override" title="Optional provider model override" disabled={settingsBusy}/>
        </div>
        <label className="form-label">Nomi personality and style guide
          <textarea value={systemPrompt} onChange={event => setSystemPrompt(event.target.value)} maxLength={2000} placeholder="Optional: calm, curious, direct… This adjusts style only; child-safety rules cannot be overridden." disabled={settingsBusy}/>
        </label>
        <div className="key-input-row">
          <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={event => setApiKey(event.target.value)} autoComplete="off" placeholder={settings?.apiKeyConfigured ? 'Leave empty to keep the protected key' : 'Provider API key'} title="Provider API key" disabled={settingsBusy}/>
          <button type="button" className="text-button" onClick={() => setShowKey(value => !value)}>{showKey ? 'Hide' : 'Show'}</button>
          <button type="button" className="btn-secondary" onClick={() => { void saveSettings(); }} disabled={settingsBusy || (requiresKey && !apiKey.trim())}><Save size={15}/>{settingsBusy ? 'Saving…' : 'Save AI settings'}</button>
        </div>
        {settingsStatus && <p className={settingsStatus.includes('could not') || settingsStatus.includes('required') ? 'form-error' : 'form-success'} role="status">{settingsStatus}</p>}
      </div>

      <div className="llm-chat">
        <h4><Sparkles size={16}/> Ask your AI assistant</h4>
        <div className="llm-quick-prompts">
          {quickPrompts.map(prompt => <button key={prompt} onClick={() => setQuery(prompt)}>{prompt}</button>)}
        </div>
        <div className="llm-input-row">
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ask about learning patterns, schedule ideas, or app improvements…" onKeyDown={event => event.key === 'Enter' && void ask()} title="Your question"/>
          <button className="btn-primary" onClick={() => { void ask(); }} disabled={loading || !query.trim() || !settings || requiresKey} title="Send to AI">
            {loading ? <Loader2 size={17} className="spin"/> : <Send size={17}/>}
          </button>
        </div>
        {response && <div className="llm-response"><div className="llm-response-header"><Sparkles size={15}/><span>{providerLabel(settings?.provider || provider)} says:</span></div><p>{response}</p></div>}
      </div>
    </section>
  );
}
