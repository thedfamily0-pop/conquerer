import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validEmails = (value: unknown): string[] => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string').map(item => item.trim().toLowerCase()).filter(item => EMAIL_PATTERN.test(item)))] : [];

type ReportKind = 'daily' | 'weekly';
type Row = Record<string, unknown>;
function localParts(timezone: string, date = new Date()): { date: string; hour: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(date);
  const get = (type: string) => parts.find(part => part.type === type)?.value || '0';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')), day: weekday < 0 ? 0 : weekday };
}
function dateDaysBefore(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}
function localDate(value: unknown, timezone: string): string | null {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : localParts(timezone, date).date;
}
function safe(value: unknown, fallback = ''): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).slice(0, 500);
  return fallback;
}

function scoreSubjects(events: Row[], results: Row[]): Array<{ subject: string; score: number; attempts: number }> {
  const subjects = new Set([...events.map(event => safe(event.subject)), ...results.map(result => safe(result.subject))]);
  return [...subjects].filter(Boolean).map(subject => {
    const subjectEvents = events.filter(event => event.subject === subject && Number(event.total) > 0);
    const eventScore = subjectEvents.length ? subjectEvents.reduce((sum, event) => sum + Number(event.score) / Number(event.total), 0) / subjectEvents.length * 100 : null;
    const subjectResults = results.filter(result => result.subject === subject && Number(result.max_score) > 0);
    const resultScore = subjectResults.length ? subjectResults.reduce((sum, result) => sum + Number(result.score) / Number(result.max_score), 0) / subjectResults.length * 100 : null;
    const score = eventScore === null ? Math.round(resultScore || 0) : resultScore === null ? Math.round(eventScore) : Math.round(resultScore * 0.4 + eventScore * 0.6);
    return { subject, score, attempts: subjectEvents.length };
  }).sort((a, b) => a.score - b.score);
}

function buildReport(kind: ReportKind, child: Row, events: Row[], results: Row[], goals: Row[], schedule: Row[], reportDate: string, reportWeekday: number, timezone: string): string {
  const weekStart = dateDaysBefore(reportDate, reportWeekday === 0 ? 6 : reportWeekday - 1);
  const windowEvents = events.filter(event => {
    const occurredDate = localDate(event.occurred_at, timezone);
    return kind === 'daily' ? occurredDate === reportDate : Boolean(occurredDate && occurredDate >= weekStart && occurredDate <= reportDate);
  });
  const subjectScores = scoreSubjects(events, results);
  const focus = subjectScores.filter(item => item.score < 80).slice(0, 4);
  const mastered = subjectScores.filter(item => item.score >= 88 && item.attempts >= 5).slice(0, 4);
  const activityCount = windowEvents.length;
  const average = windowEvents.filter(event => Number(event.total) > 0).reduce((value, event, _index, list) => value + Number(event.score) / Number(event.total) * 100 / list.length, 0);
  const upcoming = schedule.slice(0, 8).map(item => `- ${safe(item.day_of_week)} · ${safe(item.time)} · ${safe(item.title)}`);
  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 5);
  const lines = [`CONQUERER ${kind === 'daily' ? 'DAILY RECAP' : 'WEEKLY LEARNING STRATEGY'}`, `For: ${safe(child.display_name, 'Ufefe')}`, `Date: ${reportDate}`, '', `LEARNING SNAPSHOT`, `- Learning activities recorded: ${activityCount}`, `- Current evidence average: ${windowEvents.length ? `${Math.round(average)}%` : 'Not enough new evidence yet'}`];
  if (subjectScores.length) { lines.push('', 'SUBJECT TRENDS & GAPS'); subjectScores.forEach(item => lines.push(`- ${item.subject}: ${item.score}%${item.attempts ? ` across ${item.attempts} app attempt(s)` : ' from historical results'}`)); }
  if (focus.length) { lines.push('', 'CONTENT GAME PLAN'); focus.forEach(item => lines.push(`- ${item.subject}: prioritise current-grade foundations, short guided practice, and confidence checks before extension work.`)); }
  else lines.push('', 'CONTENT GAME PLAN', '- No urgent gap detected. Continue spaced retrieval and mixed current-grade practice; extension is optional only after sustained mastery.');
  if (mastered.length) lines.push(`- Secure areas: ${mastered.map(item => item.subject).join(', ')}. Offer small next-grade challenges only after a current-grade warm-up.`);
  if (activeGoals.length) { lines.push('', 'ACTIVE SMART GOALS'); activeGoals.forEach(goal => lines.push(`- ${safe(goal.subject)}: ${safe(goal.title)}${goal.due_date ? ` (due ${safe(goal.due_date)})` : ''}`)); }
  if (kind === 'weekly') { lines.push('', 'UPCOMING NEXT WEEK'); lines.push(...(upcoming.length ? upcoming : ['- No upcoming schedule items are recorded.'])); lines.push('', 'WEEKLY STRATEGY', '- Start each focus subject with retrieval from the current work.', '- Use one worked example, one supported attempt, then an independent mastery check.', '- Only add above-grade material when the current objective is accurate and confident across repeated attempts.'); }
  return lines.join('\n');
}

async function sendReportEmail(from: string, resendKey: string, recipients: string[], subject: string, text: string, configuredRecipients: Set<string>): Promise<{ id?: string; recipients: string[] }> {
  const testSender = from.trim().toLowerCase() === 'onboarding@resend.dev';
  const testRecipient = (Deno.env.get('RESEND_TEST_RECIPIENT') || '').trim().toLowerCase();
  const deliveryRecipients = testSender ? (EMAIL_PATTERN.test(testRecipient) && configuredRecipients.has(testRecipient) ? [testRecipient] : []) : recipients;
  if (!deliveryRecipients.length) throw new Error(testSender ? 'The Resend test sender has no configured account recipient.' : 'No valid report recipients are configured.');
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: deliveryRecipients, subject, text }) });
  const responseText = await response.text();
  if (!response.ok) throw new Error(responseText.slice(0, 500) || `Resend returned ${response.status}.`);
  let id: string | undefined;
  try { const parsed = JSON.parse(responseText) as { id?: unknown }; if (typeof parsed.id === 'string') id = parsed.id; } catch { /* bounded response can be empty */ }
  return { id, recipients: deliveryRecipients };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok');
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  const cronToken = Deno.env.get('REPORTS_CRON_TOKEN') || '';
  const authorization = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!supabaseUrl || !serviceRoleKey || !resendKey || !from || !cronToken || authorization !== cronToken) return json({ error: 'Report scheduler is not authorised.' }, 401);

  let requestedKind: ReportKind | 'all' = 'all';
  try { const body = await request.json() as { kind?: unknown }; if (body.kind === 'daily' || body.kind === 'weekly') requestedKind = body.kind; } catch { /* scheduled calls may have an empty body */ }
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: families, error: familiesError } = await admin.from('families').select('id');
  if (familiesError) return json({ error: 'Could not load family report jobs.' }, 500);
  const summary = { processed: 0, sent: 0, skipped: 0, failed: 0 };

  for (const family of families || []) {
    const familyId = String(family.id);
    const settingsResult = await admin.from('parent_report_settings').select('*').eq('family_id', familyId).maybeSingle();
    if (settingsResult.error) { console.error('[send-parent-reports] settings query failed', familyId, settingsResult.error.message); summary.failed++; continue; }
    const reportSettings = settingsResult.data || { daily_enabled: true, daily_hour: 20, weekly_enabled: true, weekly_day: 6, weekly_hour: 13, timezone: 'Africa/Johannesburg' };
    const parts = localParts(String(reportSettings.timezone || 'Africa/Johannesburg'));
    const dueKinds: ReportKind[] = [];
    if ((requestedKind === 'all' || requestedKind === 'daily') && reportSettings.daily_enabled && parts.hour === Number(reportSettings.daily_hour)) dueKinds.push('daily');
    if ((requestedKind === 'all' || requestedKind === 'weekly') && reportSettings.weekly_enabled && parts.day === Number(reportSettings.weekly_day) && parts.hour === Number(reportSettings.weekly_hour)) dueKinds.push('weekly');
    if (!dueKinds.length) { summary.skipped++; continue; }
    const sourceResults = await Promise.all([
      admin.from('family_contact_settings').select('dad_emails,mom_emails').eq('family_id', familyId).maybeSingle(),
      admin.from('profiles').select('id,display_name').eq('family_id', familyId).eq('role', 'child').limit(1).maybeSingle(),
      admin.from('learning_performance_events').select('subject,occurred_at,score,total').eq('family_id', familyId).gte('occurred_at', new Date(Date.now() - 35 * 86400000).toISOString()).order('occurred_at', { ascending: false }).limit(2000),
      admin.from('school_results').select('subject,score,max_score,assessment_date').eq('family_id', familyId).order('assessment_date', { ascending: false }).limit(500),
      admin.from('learning_goals').select('subject,title,due_date,status').eq('family_id', familyId).eq('status', 'active').limit(100),
      admin.from('schedule_items').select('day_of_week,time,title').eq('family_id', familyId).order('day_of_week').order('time').limit(100),
    ]);
    const sourceError = sourceResults.find(result => result.error)?.error;
    if (sourceError) { console.error('[send-parent-reports] source query failed', familyId, sourceError.message); summary.failed++; continue; }
    const [contactsResult, childResult, eventsResult, resultsResult, goalsResult, scheduleResult] = sourceResults;
    const contacts = contactsResult.data;
    const child = childResult.data;
    const events = eventsResult.data;
    const results = resultsResult.data;
    const goals = goalsResult.data;
    const schedule = scheduleResult.data;
    const configuredRecipients = new Set([...validEmails(contacts?.dad_emails), ...validEmails(contacts?.mom_emails)]);
    const recipients = [...new Set([validEmails(contacts?.dad_emails)[0], validEmails(contacts?.mom_emails)[0]].filter(Boolean))];
    if (!child || !recipients.length) { summary.skipped += dueKinds.length; continue; }

    for (const kind of dueKinds) {
      summary.processed++;
      const { data: delivery, error: deliveryError } = await admin.from('parent_report_deliveries').insert({ family_id: familyId, report_kind: kind, report_date: parts.date }).select('id').maybeSingle();
      if (deliveryError || !delivery) { summary.skipped++; continue; }
      try {
        const text = buildReport(kind, child as Row, (events || []) as Row[], (results || []) as Row[], (goals || []) as Row[], (schedule || []) as Row[], parts.date, parts.day, String(reportSettings.timezone || 'Africa/Johannesburg'));
        const subject = kind === 'daily' ? `Conquerer daily learning recap · ${parts.date}` : `Conquerer weekly learning strategy · ${parts.date}`;
        const sent = await sendReportEmail(from, resendKey, recipients, subject, text, configuredRecipients);
        await admin.from('parent_report_deliveries').update({ status: 'sent', recipient_count: sent.recipients.length, provider_message_id: sent.id || null, completed_at: new Date().toISOString() }).eq('id', delivery.id);
        summary.sent++;
      } catch (error) {
        await admin.from('parent_report_deliveries').update({ status: 'failed', error: error instanceof Error ? error.message.slice(0, 500) : 'Report delivery failed.', completed_at: new Date().toISOString() }).eq('id', delivery.id);
        summary.failed++;
      }
    }
  }
  return json(summary);
});
