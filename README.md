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
| Private diary with mood tracking and English/Afrikaans-aware TTS read-aloud | Progress tab: Quest tier, weekly engagement, Vibing project, diary |
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

- **Role-separated hosted portals**: authenticated child sessions receive only the child experience; adult sessions open Parent Zone first and have an explicit **Open Child App** action. Parent navigation is never rendered for child roles.
- **Daily learning XP cap**: Homework, Practice, Reading, Quest, Vibing, Nomi, and wellbeing rewards share a 100 XP local-calendar-day cap. Ad-hoc chores, purchases, and parent adjustments are excluded. The app reports partial or exhausted daily awards.
- **Email settings Save flow**: Parent Zone keeps a draft, provides Save/Discard controls, confirms successful persistence, and saves hosted settings server-first so a failed update does not replace active recipients.
- **Child privacy surface**: child-visible external sharing controls and parent-notification/data-sharing language were removed. Safety scans still submit alerts silently through the secure authenticated backend.
- **Per-profile PINs**: migrations `010_access_roles_and_portal_pins.sql` and `013_family_access_fail_closed.sql` add bcrypt-backed profile PINs, lockout-aware RPC verification, explicit authenticated-user-ID family approval, and Auth email recovery. On the first hosted Parent Zone visit, a valid 4–12 digit PIN is securely enrolled for the authenticated parent profile; subsequent visits verify it. Hosted mode fails closed when PIN verification is unavailable. Offline-only mode retains a device-local PIN as a convenience compatibility fallback and must not be treated as a shared-device security boundary.

### Hosted access, invitations, and contact settings

- **Migrations**: `001`–`006` establish the original schema; `007_production_hardening.sql` adds per-channel quota columns, family-scoped replacement policies, UUID-safe Nomi IDs, and the atomic quota function. `008_learning_events_retention.sql` supports hosted learning events and one-day alert pruning. `011_learning_results_reports_xp.sql` adds historical results, SMART goals, report settings, and atomic learning XP claims. `012_security_followups.sql` hardens learning-event child/family consistency, parent report visibility, and parent-only wallet writes. `013_family_access_fail_closed.sql` prevents contact email arrays from granting access. `014_family_invitations_google_onboarding.sql` adds server-managed invitation records, family administrators, Google-only acceptance, and one-time family membership binding.
- **Authentication**: hosted mode is Google-only. `AuthGate` preserves an opaque invitation token across the OAuth redirect, redeems it server-side against the Google-verified account, then calls `ensure_family_setup(...)`. Password sign-in and signup are intentionally not offered in the app.
- **Family membership**: `family_members(family_id, user_id, role)` remains the source of truth. Email recipient arrays and `child_email` contact settings never grant access.
- **Family invitations**: a family administrator creates a parent or child invitation in Parent Zone → Settings. `send-family-invitation` creates a random single-use token server-side, stores only its hash, sends the welcome link through Resend, expires it after seven days, and redeems it only when the matching invited email signs in with Google. Invitation state is pending, accepted, revoked, or expired.
- **Administrator authority**: the bootstrap account creates the first family and becomes its first family administrator. The original family creator can promote an existing parent through the server-side `set_family_administrator(...)` RPC; no browser-provided role or email grants administrative access.
- **RLS**: migration 007 drops the legacy public/role-only policies and replaces them with family-membership and parent-role checks. Migration 014 keeps invitation tokens inaccessible to normal table reads and exposes only sanitised invitation status to family administrators.

### Current production deployment and first family setup

The production project (`gbjkockgfntgctchkzdk`) has the application schema through migration 014, Google-only onboarding, and the active `send-family-invitation` Edge Function. The live GitHub Pages build was rebuilt with the hosted Supabase configuration. The Function has its production browser origin (`https://thedfamily0-pop.github.io`) and full invitation URL (`https://thedfamily0-pop.github.io/conquerer/`) configured server-side, never as Vite variables.

A non-sending authenticated browser smoke test from the live Pages origin reached the Function and its invitation RPC, confirming the CORS/authentication/runtime path without creating an invitation. The Resend sending domain is verified. **A real welcome email and an end-to-end parent or child redemption have not yet been tested; do not treat provider delivery as verified until an authorised recipient receives and redeems an invitation.**

Production public application data was deliberately reset after reviewing all 38 application tables. The reset preserved the public schema, RPCs, Auth users and configuration, Storage, Edge Functions, Function Secrets, and provider settings. To start fresh:

1. Clear site data for `https://thedfamily0-pop.github.io`, including `explorer_auth_v1` and other `explorer_*` browser-storage keys, then reopen the live app. This prevents an old local profile/session from masking the fresh setup journey.
2. Sign in with Google as the bootstrap administrator, `thedfamily0@gmail.com`. The server creates the first family, parent membership, unlinked child profile, contact settings, guardrail settings, and administrator record.
3. In **Parent Zone → Settings → Family invitations**, add each person’s name, Google email, and role: `parent` for Mom and `child` for the learner. This is separate from Dad/Mom alert recipients.
4. The welcome link can be redeemed only by the exact invited Google account. The server validates its opaque token, expiry, Google provider, and email before atomically creating `family_members` and linking the profile.
5. The child receives only the child experience. A parent receives Parent Zone and may open the child app deliberately. Any uninvited Google account is signed out and cannot create a family, profile, or membership.
6. To delegate administrator authority later, the original bootstrap family creator must explicitly promote an already accepted parent through the server-side administrator RPC. Contact settings and browser state cannot grant that authority.

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

Responses use short, child-friendly calming steps:
- Notice feelings without needing a perfect label.
- Try grounding with things you can see, hear, and touch; take slow, comfortable breaths without holding them.
- Choose gentle movement, drawing, music, a warm blanket, or a butterfly hug.
- If a feeling feels too big, the child is encouraged to tell a trusted grown-up now.
- Bedtime uses a body scan, a simple worry note for tomorrow, and gentle relaxation.

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
2. In Supabase Dashboard → **Authentication → Providers**, enable Google and paste the Google client ID and client secret. Disable Email/password authentication for this product; the server also rejects non-Google sessions.
3. In Google Cloud Console, add this Supabase callback URL as an authorized redirect URI:
   `https://gbjkockgfntgctchkzdk.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → **Authentication → URL Configuration**, add these Redirect URLs:
   - `https://thedfamily0-pop.github.io/conquerer/`
   - `http://localhost:5173/`
   - `http://localhost:3000/` only if another local frontend actually runs on port 3000
5. Set the Supabase **Site URL** to the live Pages URL when preparing production. Keep localhost as an additional redirect URL for development. Google OAuth and invitation links must return to the same deployed app path where the authentication action began.

Only the bootstrap Google account, `thedfamily0@gmail.com`, can create the first family. Every other parent or child account must arrive through a current welcome invitation, redeem it with the exact invited Google account, and then complete the server-side family bootstrap.

### Supabase go-live checklist and current QA status

For a new environment, complete these checks before enabling production sync:

1. Apply migrations `001` through `014` in numeric order. For the planned clean database, do this only after the invitation flow has passed a non-production test; migration 014 adds the Google-only, invitation-based family bootstrap and must be applied after 013.
2. Run Supabase security/performance advisors and verify the resulting family membership, administrator, invitation, learning-event, and wallet policies before enabling hosted sync.
3. Deploy `supabase/functions/ai-chat/index.ts` and set the Edge Function secret `GEMINI_API_KEY`. Never put that secret in Vite environment variables.
4. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` as Supabase Function Secrets, deploy `supabase/functions/send-parent-alert/index.ts`, and verify the sender domain.
5. Deploy `supabase/functions/send-family-invitation/index.ts`. Set `APP_ORIGIN` to the scheme-and-host browser origin used for CORS and `APP_URL` to the full deployed app URL used in welcome links. These are Edge Function configuration values, never Vite variables. Confirm welcome links preserve the GitHub Pages path.
6. Deploy `supabase/functions/send-parent-reports/index.ts`. Set `REPORTS_CRON_TOKEN` as a Supabase Function Secret; keep it server-side and never put it in the frontend. The intended sender is `alerts@getonlinefast.xyz` through `RESEND_FROM_EMAIL`, and the report function selects only Dad email 1 and Mom email 1.
7. Configure two hosted invocations of `send-parent-reports` with `Authorization: Bearer <REPORTS_CRON_TOKEN>` and body `{ "kind": "all" }`: daily at **20:30** and Saturday at **13:00**, both in `Africa/Johannesburg`. For `pg_cron` UTC scheduling, use `30 18 * * *` and `0 11 * * 6`. Do not expose the token in GitHub Pages variables.
8. Set Vite variables in the hosting build environment:
   - `VITE_SUPABASE_SYNC_ENABLED=true`
   - `VITE_AI_GATEWAY_ENABLED=true`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
9. Leave `VITE_ALLOW_DIRECT_AI` unset/false in production.
10. Verify the bootstrap Google account, a parent invitation, a child invitation, invitation rejection for an uninvited Google account, remote hydration, atomic cross-device learning XP claims, diary/schedule/chore/Nomi/store sync, family isolation, quota responses (30 Nomi / 10 homework / 5 parent AI per day by default), and offline fallback. Test the XP RPC with two authenticated sessions: 70 XP then 50 XP must award exactly 100 total, and replaying the same `p_client_id` must not increase the wallet.
11. Test the invitation and report functions with a non-production recipient configuration before enabling production delivery or the scheduler. Confirm an invitation is single-use and expires correctly; confirm reports contain no diary text and only the first Dad/Mom addresses are selected.

**Current QA status:** hosted checks confirm that the live Pages bundle contains the production Supabase configuration and Google-only `AuthGate`, the production invitation Function is active, its server-side origin/link configuration is present, and an authenticated non-sending browser request from the live origin reached the Function and invitation RPC. The production public application tables were reset and then verified empty; the family/invitation/PIN tables and key RPCs remain installed. The verified Resend domain has sending enabled. These checks do **not** prove a real invitation email, parent/child redemption, report delivery, active report cron jobs, configured report recipients, or cross-device XP behavior. Do not send a production report smoke test.

The source QA baseline still retains these open implementation findings: offline Parent Zone access is not role-separated and its fallback PIN is plaintext localStorage; invitation delivery and full parent/child redemption need an authorised real-recipient test; the streak rereads localStorage on every render and uses UTC dates rather than the XP cap's Johannesburg calendar; the report event fetch uses a rolling UTC window instead of a clean local-calendar boundary; and diary privacy copy conflicts with sentiment monitoring. Resolve these before calling the product rollout-ready.

## Product journey and integrations

### Current user experience

- **Offline-first default:** on first launch, the setup wizard collects the learner name, avatar, and Nomi name. The app then opens to the Today dashboard, with a morning wellbeing check-in when due.
- **Child journey:** Today leads to Learn, Quest, Read, Diary, Nomi, Store, and Shine. Homework, quests, reading, and bedtime can trigger context-aware wellbeing check-ins. Diary entries remain local-first and editable like a physical diary.
- **Parent journey:** Parent Zone is protected by the family PIN. The bootstrap administrator can manage schedules, safety settings, alert recipients, and separate parent/child Google welcome invitations; accepted parents can review progress, schedules, chores, alerts, curriculum objectives, and AI settings.
- **Opt-in production journey:** with `VITE_SUPABASE_SYNC_ENABLED=true`, a parent signs in through AuthGate, the family/child profile is bootstrapped, and local-first data is hydrated/synchronised through family-scoped Supabase policies. The child experience remains the same when the device is offline.

### Parent email recipients

Parent Zone supports **up to three valid, deduplicated addresses for Dad and three for Mom**. Existing localStorage shaped like `{ "dad": "...", "mom": "..." }` is migrated into the new array shape without changing the `explorer_parent_emails_v1` compatibility key. Empty secondary and tertiary fields are allowed. Alert builders flatten the six possible addresses into one recipient list.

The browser sends alert payloads only to the authenticated Supabase `send-parent-alert` Edge Function. The source function requires authenticated approved family membership (parent or approved child), uses the authenticated Supabase user ID as the authorization boundary, and keeps Resend credentials server-side. Its sender is read from `RESEND_FROM_EMAIL`; the intended production sender is `alerts@getonlinefast.xyz`. The shared path covers Nomi distress and emotional check-ins, URL/PII detections, flagged photos, new-device and PIN alerts, mood streaks, usage anomalies, diary sentiment trends, and opted-in schedule reminders. Browser logs report preparation and secure-function acceptance only; Resend is the source of truth for delivery status. The production Function and verified sender domain are present, but configured recipients and a fresh provider-delivery check are still required before claiming alert delivery.

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

Conquerer has source-level protections beyond the original demo: offline fallback, AuthGate, family-scoped RLS migrations, server AI quotas, an atomic learning-XP design, safety scanning, PIN locking, secure parent-alert code, scheduled-report code, and UUID-safe sync. Production hosted evidence now covers the Pages rebuild, invitation Function deployment/configuration, a non-sending authenticated Function/RPC smoke test, verified sender-domain status, and a deliberate clean reset of public application data with key objects retained. This is **not** a claim that invitation or report delivery, active report cron jobs, configured recipients, or cross-device XP behavior are verified or rollout-ready. It also retains offline role/PIN limitations, diary privacy contradiction, streak/report calendar issues, and pending physical-device/mobile speech QA. Keep rollout controlled and use an authorised recipient to test invitation delivery and redemption before treating family onboarding as proven.

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

The `supabase/functions/send-parent-alert/index.ts` function sends low-volume parent safety and monitoring alerts through Resend without exposing a provider key in the GitHub Pages bundle. It requires authenticated approved family membership (parent or approved child), uses the authenticated Supabase user ID as the authorization boundary, validates up to six recipients, and performs the provider call server-side.

For temporary Resend test-sender setup only:

```bash
# Temporary test sender: delivery is restricted to the Resend account email.
supabase secrets set \
  RESEND_API_KEY=... \
  RESEND_FROM_EMAIL=onboarding@resend.dev \
  RESEND_TEST_RECIPIENT=account@example.com \
  --project-ref YOUR_PROJECT_REF
supabase functions deploy send-parent-alert --project-ref YOUR_PROJECT_REF --use-api
```

When `RESEND_FROM_EMAIL=onboarding@resend.dev`, the function replaces the browser recipient list server-side with `RESEND_TEST_RECIPIENT`. For production, set `RESEND_FROM_EMAIL` to the verified sender—intended here to be `alerts@getonlinefast.xyz`—and leave `RESEND_TEST_RECIPIENT` only for explicit non-production test-sender use. Keep all Resend secrets in Supabase Function Secrets only; never add them to `.env`, GitHub Pages Vite variables, or browser localStorage.

The shared application email path covers Nomi distress and emotional check-ins, URL/PII detections, flagged photos, new-device and PIN alerts, mood streaks, usage anomalies, diary sentiment trends, and opted-in schedule reminders. The browser logs preparation and secure-function acceptance, while Resend delivery status remains the source of truth. Do not infer delivery from source code or browser logs; verify deployment, sender, recipients, and delivery through approved hosted checks.
# conquerer
