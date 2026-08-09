import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TIMEZONE = 'Africa/Johannesburg';
const DEFINITION_VERSION = 'learning-daily-v1';
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type EventRow = { subject: string; activity: string; occurred_at: string; score: number | string; total: number | string; hints_shown: number | string; xp_earned: number | string; is_retry: boolean };
type SubjectMetric = { subject: string; activityEventCount: number; scoredAttempts: number; pointsEarned: number; pointsPossible: number; weightedAccuracyPercent: number | null; independentAttemptRate: number | null; retryCount: number; learningXpEarned: number };

function localDate(date = new Date()): string {
  const values = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => values.find(value => value.type === type)?.value || '00';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
function localMidnightIso(date: string): string {
  return new Date(`${date}T00:00:00+02:00`).toISOString();
}
function number(value: number | string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
function rounded(value: number): number { return Math.round(value * 100) / 100; }

function buildMetrics(events: EventRow[]) {
  const subjects = new Map<string, { events: number; scored: number; earned: number; possible: number; independent: number; retries: number; xp: number }>();
  let scoredAttempts = 0; let pointsEarned = 0; let pointsPossible = 0; let independentAttempts = 0; let retryCount = 0; let learningXpEarned = 0;
  for (const event of events) {
    const subject = event.subject.trim().slice(0, 120) || 'Uncategorised';
    const aggregate = subjects.get(subject) || { events: 0, scored: 0, earned: 0, possible: 0, independent: 0, retries: 0, xp: 0 };
    const total = Math.max(0, number(event.total));
    const score = Math.max(0, number(event.score));
    const xp = Math.max(0, number(event.xp_earned));
    aggregate.events++; aggregate.xp += xp; learningXpEarned += xp;
    if (event.is_retry) { aggregate.retries++; retryCount++; }
    if (total > 0) {
      aggregate.scored++; aggregate.earned += score; aggregate.possible += total; scoredAttempts++; pointsEarned += score; pointsPossible += total;
      if (number(event.hints_shown) === 0) { aggregate.independent++; independentAttempts++; }
    }
    subjects.set(subject, aggregate);
  }
  const subjectAggregates: SubjectMetric[] = [...subjects.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([subject, value]) => ({
    subject, activityEventCount: value.events, scoredAttempts: value.scored, pointsEarned: rounded(value.earned), pointsPossible: rounded(value.possible),
    weightedAccuracyPercent: value.possible ? rounded(value.earned / value.possible * 100) : null,
    independentAttemptRate: value.scored ? rounded(value.independent / value.scored) : null,
    retryCount: value.retries, learningXpEarned: rounded(value.xp),
  }));
  return { definitionVersion: DEFINITION_VERSION, activityEventCount: events.length, activeDays: events.length ? 1 : 0, scoredAttempts, pointsEarned: rounded(pointsEarned), pointsPossible: rounded(pointsPossible), weightedAccuracyPercent: pointsPossible ? rounded(pointsEarned / pointsPossible * 100) : null, independentAttemptRate: scoredAttempts ? rounded(independentAttempts / scoredAttempts) : null, retryCount, learningXpEarned: rounded(learningXpEarned), distinctSubjectCount: subjectAggregates.length, distinctActivityCount: new Set(events.map(event => event.activity)).size, subjectAggregates };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok');
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const cronToken = Deno.env.get('LEARNING_REPORT_SNAPSHOTS_CRON_TOKEN') || '';
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!supabaseUrl || !serviceRoleKey || !cronToken || token !== cronToken) return json({ error: 'Snapshot scheduler is not authorised.' }, 401);

  let snapshotDate = addDays(localDate(), -1);
  try {
    const body = await request.json() as { snapshotDate?: unknown };
    if (typeof body.snapshotDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.snapshotDate)) snapshotDate = body.snapshotDate;
  } catch { /* Scheduled invocations may have an empty body. */ }
  const windowStartsAt = localMidnightIso(snapshotDate);
  const windowEndsAt = localMidnightIso(addDays(snapshotDate, 1));
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: families, error: familiesError } = await admin.from('families').select('id');
  if (familiesError) return json({ error: 'Could not load learning snapshot jobs.' }, 500);
  const summary = { snapshotDate, processed: 0, created: 0, skipped: 0, failed: 0 };

  for (const family of families || []) {
    summary.processed++;
    const familyId = String(family.id);
    const { data: events, error: eventsError } = await admin.from('learning_performance_events')
      .select('subject,activity,occurred_at,score,total,hints_shown,xp_earned,is_retry')
      .eq('family_id', familyId).gte('occurred_at', windowStartsAt).lt('occurred_at', windowEndsAt).limit(10000);
    if (eventsError) { console.error('[materialize-learning-report-snapshots] source query failed', familyId, eventsError.message); summary.failed++; continue; }
    const { data: snapshot, error: existingError } = await admin.from('daily_learning_report_snapshots').select('id').eq('family_id', familyId).eq('snapshot_date', snapshotDate).maybeSingle();
    if (existingError) { console.error('[materialize-learning-report-snapshots] existence check failed', familyId, existingError.message); summary.failed++; continue; }
    if (snapshot) { summary.skipped++; continue; }
    const { error: insertError } = await admin.from('daily_learning_report_snapshots').insert({
      family_id: familyId, snapshot_date: snapshotDate, timezone: TIMEZONE, window_starts_at: windowStartsAt, window_ends_at: windowEndsAt,
      definition_version: DEFINITION_VERSION, source_event_count: (events || []).length, metrics: buildMetrics((events || []) as EventRow[]),
    });
    if (insertError?.code === '23505') summary.skipped++;
    else if (insertError) { console.error('[materialize-learning-report-snapshots] insert failed', familyId, insertError.message); summary.failed++; }
    else summary.created++;
  }
  return json(summary);
});
