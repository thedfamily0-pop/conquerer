# Conquerer

A mobile-first daily learning companion and personal assistant for an 8-year-old South African learner. Built around the CAPS Grade 3/4 curriculum with a thematic weekly approach where the Life Skills topic sets the creative tone for all subjects.

## How the thematic system works

Each week has a Life Skills theme from the CAPS ATP. That theme becomes the **creative lens** for everything:

| If the theme is… | Then… |
| --- | --- |
| "Drawing & Observation" | Maths counts objects in still lifes, English learns art vocab, Afrikaans gets words like *teken/verf*, stories feature artists, Robotics programs a drawing bot |
| "Movement & Dance" | Maths measures jumps and distances, English describes body movements, stories explore dance, Vibing animates a dancer |
| "Animals & Habitats" | Maths sorts animals by size, English reads animal facts, Afrikaans learns *diere*, stories set in Kruger Park |

This makes each week feel cohesive, creative, and fun — not disconnected worksheets.

## Features

| Child-facing | Parent-facing |
| --- | --- |
| Today view with schedule, tasks, term/week banner + ATP focus | Full dashboard: Overview, Schedule, Content, XP Store, Progress, Shine, Alerts, AI, Settings |
| **Quest Map** — written-answer understanding checks (Remember → Use → Teach) | Detailed ATP objectives per subject per week (all terms) |
| **Weekly Shine** — daily reflection, affirmations, bedtime routine, Mommy's Note | **💜 Shine settings** — edit Mom's Note, Mommy Affirmation, Growing Goal |
| Custom-named AI companion with persistent memory + floating bubble | Schedule & chore manager with colour wheel + photo proof toggle |
| Private diary with mood tracking and TTS read-aloud | Progress tab: Quest tier, weekly engagement, Vibing project, diary |
| XP Store to buy rewards with earned points | Reward catalogue manager (photos, stock, pricing) |
| Vocab Book (floating 📖, saves term/week, Wrapped stats ready) | Secure Gemini gateway for parent AI (development-only BYOK fallback) |
| CAPS homework helper (Socratic, never gives answers) | ± XP point adjustment (give/take with reason) |
| Practice zone: Maths, English, Afrikaans, Robotics, Vibing | Content upload: practice questions, stories, vocab, objectives |
| 20-minute reading sessions (locked day progression) | PIN management (relocks every close) |
| Vibing term project ("Build My Dream App" — 10 milestones) | WCED 7-point grading scale on assessments |
| Photo proof for chores (camera capture, EXIF-scrubbed) | Weekly completion % metric |
| Share wins via WhatsApp/email throughout | Reports & WhatsApp sharing |
| Spotify in-app embed player | Spotify playlist configuration |
| Personalisation (name, avatar, photo, skin, background) | Content + schedule templates (download/upload) |
| First-run setup wizard | Email configuration |


## Subjects

| Subject | Type |
| --- | --- |
| Maths 🔢 | CAPS Grade 3/4: regrouping, carrying, multiplication, division, fractions |
| English 🇬🇧 | Vocabulary, comprehension, parts of speech |
| Afrikaans 🇿🇦 | Animals, colours, plurals, past tense |
| Robotics 🤖 | Sequencing, I/O, patterns, loops, conditionals, design thinking |
| Vibing 💻 | Code concepts, variables, loops, functions, project-based learning |
| Life Skills 🎯 | Weekly theme (Beginning Knowledge → Social Sciences → Creative Arts → Well-being) |

## Architecture

### Data storage (offline-first)

The browser remains the responsive source of truth. Every local write continues to work without a network connection; authenticated Supabase sync is an explicit deployment opt-in rather than a hardcoded switch. The browser never needs the Gemini secret.

| Data | localStorage | Supabase when enabled |
| --- | --- | --- |
| Profile, schedule, chores, diary, XP wallet, store | ✅ | Family-scoped sync for supported records |
| Nomi conversation history (50 messages) | ✅ | `nomi_messages` with stable client IDs |
| Vocab Book (with term/week stamps) | ✅ | `vocab_words` |
| Quest Map progress | ✅ | Local-only until a dedicated table is added |
| Parent alerts and usage events | ✅ | `parent_alerts`, `usage_events` |
| URL/PII safety detections | ✅ | `detected_links`, `pii_detections` |
| AI usage quotas | Local UX limiter | Server-authoritative `ai_usage_daily` |

### Supabase and authentication

- **Migrations**: `001`–`006` establish the original schema; `007_production_hardening.sql` adds per-channel quota columns, family-scoped replacement policies, UUID-safe Nomi IDs, and the atomic quota function. `008_learning_events_retention.sql` is a pending, review-only contract for hosted learning events and one-day alert pruning.
- **Authentication**: when `VITE_SUPABASE_SYNC_ENABLED=true`, the app requires a parent session and calls `ensure_family_setup(...)` before sync. AuthGate supports email/password and Google OAuth. Email signup now sends its confirmation link back to the current app origin/path, while Google uses the same redirect behavior.
- **Sync**: `syncEngine.ts` hydrates remote schedule, chores, diary, and Nomi messages, merges local-first data, reports failures to the console, and keeps the offline fallback.
- **RLS**: migration 007 drops the legacy public/role-only policies and replaces them with family-membership and parent-role checks. It must be reviewed and applied before enabling the flag.

### AI companion

- Offline: South African personality response library with intent detection.
- Production online mode: Nomi and homework call the authenticated `ai-chat` Edge Function, which keeps `GEMINI_API_KEY` server-side and enforces daily caps/cooldown through `consume_ai_quota`.
- Development-only direct browser calls require the explicit `VITE_ALLOW_DIRECT_AI=true` flag; do not use that flag in a live deployment.

### Parent AI Dashboard (Parent Zone → 🤖 AI)

- Theme-aware: injects the current week's Life Skills theme and objectives into prompts.
- In production, Gemini requests use the protected `ai-chat` Edge Function; no API key is entered into the child-facing app or stored in browser localStorage.
- OpenAI/Claude and browser Gemini keys are retained only as development/demo options behind `VITE_ALLOW_DIRECT_AI=true`.
- The server quota is separate by channel: Nomi 30/day, homework 10/day, parent AI 5/day, plus a 100-request family-user total cap and a three-second cooldown by default. Parent settings are stored in the family guardrail record after migration 007.

### Vocab Book

- Floating 📖 button accessible from anywhere
- Words stamped with current term + week number
- Search, filter, delete
- `getWrappedStats()` ready for end-of-term Spotify-Wrapped-style infographic
- Syncs to `vocab_words` table when live

### Content pipeline

- **📥 Download Template**: markdown with theme instructions + LLM formatting rules + current week's ATP objectives
- **📤 Upload Content**: JSON import merges schedule, chores, stories, questions, objectives
- Template includes the thematic philosophy so any LLM generates aligned content
- Template file named by week (`explorer-content-template-week3.md`) for context

### CAPS ATP Curriculum Alignment

Full Term 3 and Term 4 ATP data covering 10 weeks × 5 subjects each:

**Term 3** (`src/data/term3ATP.ts`) — currently active (Jul 22 – Sep 26):
- **Mathematics** — Number range 0–800, addition/subtraction (3-digit), multiplication/division fact fluency, time, length, 2-D shapes/symmetry/perimeter, fractions (equivalence), data handling, number patterns
- **English HL** — Instructions & procedures, information reports, nouns, adjectives & adverbs, descriptive writing, book reviews, narrative with direct speech, dictionary skills & prefixes
- **Afrikaans FAL** — Themed vocabulary (school, sport, house, health, shopping, daily actions, nature, friends)
- **Life Skills** — Creative Arts & PE focus: colour theory, pattern & texture, observational drawing, movement & dance, drama, rhythm & body percussion, singing, craft & design, team games
- **Coding & Robotics** — Algorithms, sequences & debugging, pattern recognition, decomposition, loops, combining sequences & loops, robots, internet basics, application skills

**Term 4** (`src/data/term4ATP.ts`):
- **Mathematics** — Place value, 3-digit operations, multiplication/division, fractions, capacity, mass, patterns, shapes, data handling
- **English HL** — Recount, narrative writing, past tense, non-fiction, descriptive writing, poetry, letters, comprehension, creative writing
- **Afrikaans FAL** — Themed vocabulary (holiday, animals, food, colours, body, weather, transport, celebrations)
- **Life Skills** — Relationships, rights, body safety, road safety, nutrition, visual arts, performing arts, PE, goal setting
- **Coding & Robotics** — Algorithms, IF-THEN conditions, loops, sensors, robot building, internet safety, application skills, projects

The ATP data flows into: Today View, Practice Zone, Quest Map, Homework Assistant, Template Downloader, and Parent Portal.

### Wellbeing Check-ins (DBT-informed)

Context-aware emotional check-ins appear as a modal at 5 moments, each with its own title, prompt and response set:

| Trigger | Fires from |
| --- | --- |
| `morning` | App mount, 800 ms delay |
| `after-homework` | `HomeworkAssistant.onCompleteHomeworkStep` |
| `after-quest` | `QuestMap.onEarnXp` |
| `after-reading` | `ReadingCompanion.onEarnXp` |
| `bedtime` | App mount when local time is 19:00+ |

Completed check-ins are recorded per-day in `localStorage` (`explorer_checkins_today_v1`) so the child is never asked twice for the same moment. Dismissing counts as done.

Responses use child-adapted DBT skills:
- **Distress Tolerance**: TIPP (Temperature, Intense exercise, Paced breathing, Progressive relaxation), ACCEPTS, self-soothe with 5 senses
- **Mindfulness**: 5-4-3-2-1 grounding, body scan, Wise Mind, STOP skill
- **Emotion Regulation**: Butterfly Hug (bilateral tapping), Worry Time, progressive muscle relaxation
- Bedtime has separate response set with sleep-focused techniques

**Feelings Wheel** — "I don't know how I feel" opens a two-step guided wheel:
1. Core categories: Something good / bad / scary / unfair / mixed up
2. Sub-feelings with body-based descriptions ("My tummy feels heavy", "My hands feel shaky")

Sub-feelings map to the 6 primary emotions, triggering the appropriate DBT coping response. Builds emotional vocabulary through repeated exposure to nuanced words (frustrated, overwhelmed, grateful, proud, lonely).

### Quest Map (understanding evaluation)

Written-answer system that tests whether the child actually absorbed the week's learning:

| Level | What it tests | Stars | Example prompt |
| --- | --- | --- | --- |
| 💡 Remember | Can you recall it? | ⭐ 1 | "Tell me 2 things you remember about fractions" |
| 🔧 Use It | Can you apply it? | ⭐⭐ 2 | "Give a real-life example of when you'd use fractions" |
| 🎓 Teach It | Can you explain why? | ⭐⭐⭐ 3 | "Explain fractions to your 6-year-old cousin" |

- **Written answers** — no multiple choice. Child must demonstrate understanding in their own words.
- **Keyword evaluation** — checks for key concepts. Scores: Excellent / Good / Developing / Retry.
- **Model answer** shown after each submission so child learns from the comparison.
- **Understanding tier** — Emerging → Developing → Secure → Mastery (parent-visible metric).
- **All answers stored** — timestamps, attempt count, exact text. Verifiable evidence of comprehension.
- Questions written in 8-year-old language via `childify()` — never raw CAPS terminology.
- Display name auto-capitalised on load (profile loader).
- Quest progress migrates gracefully from old data formats (no NaN).

### Reading sessions (20 min)

- ~2500-3000 words per story
- 2 stories per week, locked progression (Story 1 → days 1-2, Story 2 → days 3-4)
- Different comprehension questions per day pair
- South African settings and characters aligned to weekly theme

### Term project (Vibing)

"Build My Dream App" — 10-week project with weekly milestones:
1. Brainstorm → 2. Wireframe → 3. Pseudocode → 4. Animation/Loops → 5. Logic →
6. Variables → 7. I/O → 8. Design → 9. Testing → 10. Presentation

## Security & privacy

### Child safety layers
- Parent Zone PIN-locked, relocks on every close; inactivity timeout now presents an actual PIN lock screen.
- Diary: child writes, parents read-only in the UI and diary text is not included in reports.
- EXIF stripped from photos; image checks remain lightweight client-side validation, not a certified NSFW classifier.
- Child safety keyword scanning on inputs and response scanning on AI output.
- Production AI keys stay in the Supabase Edge Function secret store; browser keys are development-only.
- Safety, URL, PII, usage, and parent-alert events have durable Supabase insert paths when authenticated sync is enabled.

### AI safety pipeline
1. **Client UX limiter** — available hours, aggregate cap, per-channel cap, and cooldown.
2. **Server quota** — authenticated Edge Function calls `consume_ai_quota` atomically before Gemini access.
3. **Prompt injection protection** — client and server reject manipulation patterns.
4. **Distress scanning** — urgent inputs produce reassurance and a durable parent alert; transactional email still requires a configured provider.
5. **Response scanning** — client and server reject blocked or highly negative output.
6. **Offline fallback** — network, quota, or provider failure returns the built-in child-safe response bank.

### Input monitoring (transparent to child)
- URL/link and PII detections are allowed through for continuity, logged to scoped tables, and shown in Parent Zone alerts.
- Mood streak, usage anomaly, and diary trend checks remain local-first; parent alerts are persisted when sync is online.

### Data protection
- **Family isolation** — migration 007 replaces legacy `USING (true)` and role-only policies with family membership checks.
- **UUID-safe sync** — local IDs such as `d_1` are mapped to generated UUIDs before reaching UUID columns.
- **Conversation memory** — local 100-message/30-day pruning remains; long-term memory extraction is not routed directly from the browser to Gemini.

## AI Homework Assistant

`src/services/aiTutor.ts` exposes:

```ts
analyzeHomeworkQuestion(questionText: string, apiKey?: string): Promise<HomeworkAnalysis>
```

- **Production** — uses the authenticated Gemini gateway with current-week CAPS ATP context, runtime JSON validation, and server quota enforcement.
- **Development** — direct Gemini is allowed only when `VITE_ALLOW_DIRECT_AI=true` and a parent-managed demo key is present.
- **Offline or failed request** — uses the built-in Socratic bank for subtraction, addition, and general problem solving.

The app remains a lightweight static/offline-first PWA. The rejected Python/Ollama backend was not restored.

## Deployment

### GitHub Pages (offline-first default)
Push to `main` → `.github/workflows/deploy.yml` auto-deploys. Without the opt-in environment flag, the app remains localStorage-first and does not require a backend.

### Google Auth setup

Google sign-in is implemented in `AuthGate` and uses Supabase Auth. No Google client secret belongs in the Vite bundle.

1. In Google Cloud Console, create an OAuth client under **APIs & Services → Credentials → OAuth client ID → Web application**.
2. In Supabase Dashboard → **Authentication → Providers → Google**, enable Google and paste the Google client ID and client secret.
3. In Google Cloud Console, add this Supabase callback URL as an authorized redirect URI:
   `https://gbjkockgfntgctchkzdk.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → **Authentication → URL Configuration**, add these Redirect URLs:
   - `https://thedfamily0-pop.github.io/conquerer/`
   - `http://localhost:5173/`
   - `http://localhost:3000/` only if another local frontend actually runs on port 3000
5. Set the Supabase **Site URL** to the live Pages URL when preparing production. Keep localhost as an additional redirect URL for development. Email confirmation links and Google OAuth links use the current app origin/path, so the app must be opened from the same URL where the authentication action began.

The Google account becomes the authenticated parent account. The existing `ensure_family_setup(...)` flow creates or loads the family and child profile after the OAuth session returns.

### Supabase go-live checklist

Do **not** enable production sync until these steps are completed in a Supabase development project:

1. Apply migrations `001`–`007` and review the RLS advisor output. Migration 007 is destructive to legacy policy definitions but does not delete application rows; take a backup and verify family membership data first.
2. Review `008_learning_events_retention.sql` separately before applying it. It adds the hosted learning-event contract and a service-role-only one-day parent-alert pruning function; it has not been applied by this code change.
3. Deploy `supabase/functions/ai-chat/index.ts` and set the Edge Function secret `GEMINI_API_KEY`. Never put that secret in Vite environment variables.
4. For low-volume transactional alerts, set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` as Supabase Function Secrets and deploy `supabase/functions/send-parent-alert/index.ts`.
5. Configure Supabase Auth email/password (or add a verified magic-link flow) and test parent signup, session refresh, family bootstrap, child-profile access, and sign-out.
6. Set Vite variables in the hosting build environment:
   - `VITE_SUPABASE_SYNC_ENABLED=true`
   - `VITE_AI_GATEWAY_ENABLED=true`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
7. Leave `VITE_ALLOW_DIRECT_AI` unset/false in production.
8. Verify remote hydration, diary/schedule/chore/Nomi sync, family isolation, quota responses (30 Nomi / 10 homework / 5 parent AI per day by default), and offline fallback before changing the live deployment.

The migration has **not** been applied remotely by this code change, and the GitHub workflow still needs the Vite variables added as repository/environment secrets before a hosted build can use the production path.

## Product journey and integrations

### Current user experience

- **Offline-first default:** on first launch, the setup wizard collects the learner name, avatar, and Nomi name. The app then opens to the Today dashboard, with a morning wellbeing check-in when due.
- **Child journey:** Today leads to Learn, Quest, Read, Diary, Nomi, Store, and Shine. Homework, quests, reading, and bedtime can trigger context-aware wellbeing check-ins. Diary entries remain local-first and editable like a physical diary.
- **Parent journey:** Parent Zone is protected by the family PIN. Parents can review progress, schedules, chores, alerts, curriculum objectives, AI settings, safety guardrails, and up to three alert email addresses for each adult.
- **Opt-in production journey:** with `VITE_SUPABASE_SYNC_ENABLED=true`, a parent signs in through AuthGate, the family/child profile is bootstrapped, and local-first data is hydrated/synchronised through family-scoped Supabase policies. The child experience remains the same when the device is offline.

### Parent email recipients

Parent Zone now supports **up to three valid, deduplicated addresses for Dad and three for Mom**. Existing localStorage shaped like `{ "dad": "...", "mom": "..." }` is migrated into the new array shape without changing the `explorer_parent_emails_v1` compatibility key. Empty secondary and tertiary fields are allowed. Alert builders flatten the six possible addresses into one recipient list.

The browser currently prepares and logs alert payloads; it does not claim delivery. For real safety, schedule, and transactional messages, use a Supabase Edge Function with a provider such as Resend, Postmark, or SendGrid. Keep the provider API key in Edge Function secrets and never call the provider directly from the browser. Supabase Auth email is suitable for authentication flows, not a complete application-notification system.

### GitHub Pages launch

1. Push the repository to GitHub without committing `.env` files or API keys.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. The existing `.github/workflows/deploy.yml` builds `dist` and deploys it. It now reads the production Vite flags from GitHub `vars` and Supabase values from GitHub `secrets`.
4. For the offline launch, leave `VITE_SUPABASE_SYNC_ENABLED` and `VITE_AI_GATEWAY_ENABLED` false/empty. For the hosted path, configure `VITE_SUPABASE_SYNC_ENABLED=true`, `VITE_AI_GATEWAY_ENABLED=true`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` only after hosted migrations, Auth, RLS, and the `ai-chat` Edge Function have been tested.
5. Keep `VITE_ALLOW_DIRECT_AI=false`. `GEMINI_API_KEY` belongs only in Supabase Edge Function secrets.

GitHub Pages is static hosting. It can build and serve the PWA, but it cannot run Supabase migrations, an Edge Function, a database, a private email relay, or an always-running family agent. GitHub Free is sufficient for the repository, Actions build/deploy workflow, Pages hosting, issues, and project planning; Supabase and an email/AI provider remain separate services.

### Telegram and family AI agent extension

Telegram is a feasible future interface through a Bot or Mini App, but the app should not expose a hidden backdoor. A safe integration is an authenticated gateway with explicit family/member scopes, rate limits, audit logs, parent approval, and no database credentials in Telegram or the browser. The same gateway can later expose approved actions such as reading child-safe progress summaries, creating parent alerts, retrieving an approved schedule, requesting a wellbeing check-in, or asking Nomi/homework. Diary and sensitive child data should require separate explicit consent scopes.

### Go-live confidence

Conquerer is substantially safer than the original demo: it has offline fallback, AuthGate, family-scoped RLS migrations, server AI quotas, local caps, safety scanning, PIN locking, and UUID-safe sync. It is **not yet foolproof or verified live**. Hosted migrations, Auth configuration, RLS advisor review, Edge Function deployment, real transactional email delivery, remote hydration, and production smoke testing are still required. LocalStorage can also be edited on a shared device, and there is no automated test suite yet.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build
```

## Environment variables

```env
# Required only for authenticated Supabase sync / Edge Function use
VITE_SUPABASE_SYNC_ENABLED=false
VITE_AI_GATEWAY_ENABLED=false
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Development/demo only; do not enable in production
VITE_ALLOW_DIRECT_AI=false
```

The server-side secret belongs in Supabase Edge Function secrets:

```bash
supabase secrets set GEMINI_API_KEY=...
supabase functions deploy ai-chat
```

See [CHANGELOG.md](./CHANGELOG.md) for full release history.

## Parent performance reporting

Parent Zone → Progress now includes the **Conquerer learning signal**. It is intentionally separate from the reward economy:

- **Engagement Score**: a participation signal based on active learning days and completed learning actions in the selected period. It is not a school mark.
- **Academic Performance Score**: verified points earned divided by verified points possible from stored Practice, Reading, Homework, and Quest events. XP, chores, wellbeing, and parent adjustments do not contribute.
- **Confidence / Evidence**: `performance × (70% + 30% × independent attempt rate)`. A hint lowers confidence modestly because it indicates support was used, not because the child failed. Evidence labels are: fewer than 3 scored attempts = **Not enough evidence yet**, 3–5 = Early signal, 6–9 = Moderate confidence, and 10+ = Stronger confidence.
- **Quest evidence**: each checkpoint contributes once to the score. Repeated answers are retained as retry history, but cannot add duplicate stars or XP. Generic words such as “use”, “help”, “when”, and “because” cannot prove understanding by themselves.
- **WCED-style display**: the dashboard maps the Academic Performance Score to the existing seven-level WCED scale as an informal parent-facing reference, not an official school assessment.
- **Time filters**: 24 hours, current week, current month, current term, and all-time history. Diary entries and family-agent access to diary content remain excluded.

## Stage 1 transactional email boundary

The optional `supabase/functions/send-parent-alert/index.ts` function sends low-volume parent safety alerts through Resend without exposing a provider key in the GitHub Pages bundle:

```bash
supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL=alerts@example.com
supabase functions deploy send-parent-alert
```

The function requires an authenticated parent session and accepts at most six validated recipients. It is not deployed by local code changes. Keep `RESEND_API_KEY` and the verified sender address in Supabase Function Secrets only; never add them to `.env`, GitHub Pages Vite variables, or browser localStorage. Until the function and sender domain are configured, Conquerer stores the in-app alert and reports that the parent alert was prepared, not delivered.
# conquerer
