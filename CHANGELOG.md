# Changelog

## [1.1.6] — 2026-08-09

### Fixed — Auth confirmation redirects

- Email/password signup now passes the current Conquerer origin and path as Supabase `emailRedirectTo`.
- Documented the correct local development callback (`http://localhost:5173/`) and GitHub Pages callback.
- Prevents confirmation links from redirecting to an unrelated or inactive `localhost:3000` server.

## [1.1.5] — 2026-08-09

### Added — Google Auth option

- Added a Supabase Google OAuth sign-in button to AuthGate while retaining email/password authentication.
- OAuth redirects preserve the current origin and GitHub Pages `/conquerer/` path.
- Documented Google Cloud OAuth client, Supabase provider, callback, and redirect URL setup. No Google secret is stored in the public Vite bundle.

### Added — Parent Performance Dashboard and Stage 1 email boundary

- Added local-first `explorer_performance_v1` learning events for practice, reading, homework, and Quest evidence. Hints are recorded as a modest confidence factor; diary content is excluded.
- Added Parent Zone performance filters for 24 hours, current week, current month, current term, and all time, with separate Engagement Score, Academic Performance Score, confidence/evidence label, subject breakdown, WCED-style parent signal, Quest answers, and retry history.
- Quest checkpoints now award stars and XP once per checkpoint; retries remain visible but cannot inflate totals. Generic words cannot independently prove understanding.
- Homework performance now requires a child-generated written response before a step contributes academic evidence. XP, chores, wellbeing, and parent adjustments remain separate from academic confidence.
- Removed the hardcoded Supabase project/key fallback and the hardcoded parent PIN fallback. Missing Vite configuration now stays offline/fails closed.
- Added a Supabase `send-parent-alert` Edge Function for optional low-volume Resend delivery. `RESEND_API_KEY` and `RESEND_FROM_EMAIL` belong only in Supabase Function Secrets; browser logs say “prepared” and never claim inbox delivery.

### Validation boundary

- Local `npm run build` and `npm run lint` pass. No hosted migration, Edge Function deployment, Resend secret, or production database change was applied.

All notable changes to Conquerer are recorded here. The project uses an adapted [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

## [1.1.3] — 2026-08-09

### Changed — Conquerer branding and multi-recipient parent alerts

- Renamed current user-facing product branding from Explorer AI to **Conquerer** across the PWA metadata, navigation, setup flow, sharing, reports, templates, reminders, safety alerts, AI prompts, and documentation. Internal `explorer_*` localStorage keys and Supabase identifiers remain unchanged for compatibility.
- Added backwards-compatible parent email settings with up to three validated, deduplicated addresses each for Dad and Mom. Existing single-string `{ dad, mom }` localStorage data is migrated on load; empty secondary and tertiary fields are supported.
- Centralised recipient flattening so wellbeing, safety, URL/PII, image, device, PIN, diary, usage, and schedule alert payloads can target all configured recipients.
- Updated the GitHub Pages workflow to pass explicit Vite deployment flags and Supabase public configuration from GitHub variables/secrets while keeping direct browser AI disabled.
- Documented the current Conquerer journey, GitHub Pages launch process, GitHub Free boundaries, Telegram direction, safe family-agent integration pattern, transactional email recommendation, and remaining go-live caveats.

### Validation boundary

- The changes are local only. No hosted Supabase migration, Auth configuration, Edge Function deployment, email provider, or production database change was applied.
- The browser still prepares/logs email payloads; real delivery requires a server-side transactional provider such as Resend behind a Supabase Edge Function.

## [1.1.2] — 2026-08-09

### Added — Supabase and AI production-readiness implementation

- Added an opt-in `AuthGate` for parent email/password sign-in and signup. It is shown only when `VITE_SUPABASE_SYNC_ENABLED=true`, so the lightweight offline PWA remains the default.
- Added `supabase/functions/ai-chat/index.ts`. Nomi, homework, and parent Gemini requests can use one authenticated Edge Function; the Gemini secret stays in Supabase Function Secrets rather than the browser bundle.
- Added `supabase/migrations/007_production_hardening.sql`, which:
  - Adds per-channel guardrail settings and stable client IDs for Nomi messages.
  - Replaces legacy public/role-only RLS policies with family-membership and parent-role policies.
  - Adds atomic server quota consumption for total, Nomi, homework, parent, cooldown, and allowed-hour limits.
  - Keeps child-profile bootstrap and family guardrail settings aligned.

### Changed

- Removed the hardcoded `DEV_MODE` switch. `VITE_SUPABASE_SYNC_ENABLED` now explicitly enables authenticated sync; localStorage/offline behavior remains unchanged when false.
- Sync now performs family/child bootstrap, remote hydration, local-first merging, UUID mapping for local IDs such as `d_1`, stable Nomi upserts, and visible console warnings instead of silent failures.
- Nomi, homework, and the parent Gemini dashboard prefer the secure gateway. Direct browser AI calls are available only with explicit development flag `VITE_ALLOW_DIRECT_AI=true`.
- Added local UX caps (Nomi 30/day, homework 10/day, parent 5/day, total 100/day, three-second cooldown) and server-authoritative quota enforcement when the gateway is enabled.
- Parent alerts, usage events, URL/PII detections, XP wallet, store items, and purchases now have durable family-scoped Supabase sync paths when authenticated sync is online. The existing email helper no longer falsely claims that an email was delivered; a transactional email provider still needs to be configured.
- Session timeout now presents an actual family-PIN lock screen instead of only showing a toast.
- Homework gateway responses receive runtime shape validation before being shown to the child.

### Validation and known deployment boundary

- `npm run build` passes.
- `npm run lint` passes with four existing Fast Refresh export warnings in `WellbeingCheckin.tsx`; no lint errors.
- Local Supabase SQL lint could not run because Docker/Postgres is not running; Deno Edge Function type-checking could not run because Deno is not installed.
- Migration 007 has not been applied to the hosted project, the Edge Function has not been deployed, and GitHub Pages workflow secrets have not been configured. Do not enable `VITE_SUPABASE_SYNC_ENABLED` in the live build until those steps are completed and RLS/hydration/quota tests pass.


## [1.1.1] — 2026-08-09

### Fixed — Full codebase audit before go-live

- **Build was broken.** `tsc -b` exited with code 2: `resetSession` in `HomeworkAssistant.tsx` was declared but never referenced, meaning there was no way for the child to clear a question and ask a second one. Wired it to a new "Ask a new question" button beside the step counter.
- **Rules-of-hooks violation causing a first-run white screen.** `const [musicOpen, setMusicOpen] = useState(false)` was placed *after* the `if (!profile.setupDone) return <SetupWizard/>` early return. On a fresh install React recorded N hooks during the wizard, then N+1 once setup completed, throwing "Rendered more hooks than during the previous render" and blanking the app. This affected every brand-new user. Hook moved above the early return.
- **Wellbeing check-in trigger system was dead code.** The `checkinModal` state and the morning/bedtime `useEffect` triggers existed, but the modal was never rendered anywhere in the tree, and the resulting unused-variable errors had been masked with a `void checkinModal;` statement and a `markCheckinDone as _markCheckinDone` import alias. Only the inline Learn-tab check-in was ever reachable. Now properly wired:
  - `<WellbeingCheckin isModal>` renders at the app root when `checkinModal` is set
  - `after-homework` fires from `HomeworkAssistant.onCompleteHomeworkStep`
  - `after-quest` fires from `QuestMap.onEarnXp`
  - `after-reading` fires from `ReadingCompanion.onEarnXp`
  - Dismissing or completing a check-in marks it done for the day so it never repeats

### Removed
- **Reverted the local LLM backend experiment.** A Python/Flask + Ollama service (`/local-llm-backend`) and a hybrid "local-first, escalate-to-Gemini" tutor path had been added. Both were removed because they broke the app's core architecture: Explorer AI is a static client-side PWA on GitHub Pages, and this required Python, a virtualenv, Ollama and a multi-gigabyte Llama 3 model running on the same device as the child's browser. The keyword-overlap `learnings.json` retrieval also added no measurable answer quality for Grade 3 homework.
- `aiTutor.ts` restored to a single exported `analyzeHomeworkQuestion(questionText, apiKey?)` — Gemini when a parent key exists, offline Socratic bank otherwise.
- `HomeworkAssistant.tsx` no longer tracks per-session question history for escalation.

### Known blockers before `DEV_MODE = false`
Documented here so they are not forgotten. **Do not flip the flag until these are resolved.**

1. **No authentication exists, but every RLS policy depends on `auth.uid()`.** There is no `signIn`/`signUp`/`getUser` call anywhere in `src/`. With only the anon key and no session, `auth.uid()` is `NULL`, so policies such as `using (auth.uid() = user_id)` all evaluate false and every read/write is rejected.
2. **Sync failures are silent.** Every function in `syncEngine.ts` ends with `catch { /* Fail silently */ }`, and `initSync()` returns early at `if (!session)` leaving `childProfileId` null — after which every sync function bails on its `if (!online || !childProfileId) return` guard. Combined with localStorage being the source of truth, the app would *appear* to work while persisting nothing remotely. Failures need to at least warn, ideally show a "not synced" state in Parent Zone.
3. **Anon key is hardcoded** as a fallback in `src/services/supabase.ts` and will ship inside the public GitHub Pages bundle. Rotate it, and audit every table for permissive `USING (true)` policies before going live.

Verification status: `npm run build` exits 0; `npm run lint` reports 0 errors (5 cosmetic warnings — 4 fast-refresh export hints in `WellbeingCheckin.tsx`, 1 `exhaustive-deps` hint in `App.tsx`).

## [1.0.0] — 2026-08-09

### Added
- **📚 Content tab** in Parent Zone — dedicated section for managing practice content separately from schedule. Two clear workflows:
  - Practice content (questions, stories, vocab, objectives) with themed template
  - Schedule & chores with a simpler no-AI-needed template
- **Content upload log** — every upload is recorded with date, term/week, filename, file size, subjects, and item counts. Visible as a weekly audit trail in the Content tab.
- **Supabase content tables** — `practice_questions`, `reading_stories`, `weekly_objectives`, `content_uploads` with proper RLS (parents write, everyone reads). Migration applied via CLI.
- **Content sync service** (`contentSync.ts`) — push/fetch functions for all content types, ready for when DEV_MODE is disabled.
- **Photo evidence for chores** — parent toggles "📸 Require photo proof" per chore. Child must take a camera photo (EXIF-scrubbed, resized to 800px) to mark it done. Photos visible in Parent Zone Progress tab as a gallery.
- **Spotify embed player** — tapping 🎵 opens an in-app Spotify player panel (no redirect). Parent sets playlist URL in Settings. Plays full tracks for Premium users, 30s previews for free.
- **Vocab Book** — floating 📖 button, words stamped with term/week, search/filter, `getWrappedStats()` for end-of-term infographic. Supabase `vocab_words` table ready.
- **Thematic content framework** — Life Skills weekly theme is the creative lens for all subjects. LLM Dashboard and templates inject theme context into all generated content.
- **`themeTag` field** on PracticeQuestion for filtered themed content delivery.

### Changed
- Parent Zone tabs: 📊 Overview · 📅 Schedule · 📚 Content · 🎁 XP Store · 📈 Progress · 🚨 Alerts · 🤖 AI · ⚙️ Settings
- Spotify changed from link-out to embedded in-app player panel
- Content and schedule templates separated (different purposes, different formats)

### Fixed
- Supabase migration INSERT policy syntax (`WITH CHECK` instead of `USING`)
- Applied content tables via CLI `supabase db query` after initial dashboard failure

## [0.9.1] — 2026-08-09

### Added — Term 3 CAPS ATP Curriculum Data

- **Full Term 3 ATP mapping** (`src/data/term3ATP.ts`) — 10-week curriculum plan for Grade 3 Term 3 across all 5 subjects:
  - **Mathematics** — Number range 0–800, addition/subtraction (3-digit), multiplication & division fact fluency, time (analogue/digital/duration), length (m/cm/mm), 2-D shapes with symmetry & perimeter, fractions (equivalence), data handling, number patterns
  - **English HL** — Instructions & procedures, procedural writing, information reports, nouns (common/proper/collective), adjectives & adverbs, descriptive writing & conjunctions, book reviews, narrative with direct speech, dictionary skills & prefixes
  - **Afrikaans FAL** — Themed vocabulary: My Skool, Sport en Speel, My Huis, Gesondheid, Inkopies, Dinge wat ek doen, Die Natuur, Vriende
  - **Life Skills** — Creative Arts & PE focus: colour theory, pattern & texture, observational drawing, creative movement & dance, drama & role-play, rhythm & body percussion, singing & melody, craft & 3-D design, team games & ball skills, arts showcase
  - **Coding & Robotics** — Algorithms, sequences & debugging, pattern recognition & decomposition, loops (repeat), combining sequences & loops, robots (input/process/output), robot design, internet basics, word processing & drawing, consolidation
- **AI tutor now serves Term 3** — `aiTutor.ts` updated to load `getTerm3ATPWeek()` when `termInfo.term === 3`. Since we're currently in Term 3 (Jul 22 – Sep 26), the homework assistant now aligns guidance to this week's actual curriculum topics.
- Helper functions: `getTerm3ATPWeek(week)`, `getTerm3ATPBySubject(subject)`, `getTerm3LearningOutcomes(week, subject)`

### Added — Child-Friendly DBT Skills in Wellbeing Check-ins

- **Wellbeing coping techniques rewritten** using evidence-based DBT (Dialectical Behaviour Therapy) skills adapted for an 8-year-old:
  - **Worried** — TIPP (Temperature: cold water/ice), Paced Breathing (4-in, 6-out), 5-4-3-2-1 Grounding (Mindfulness)
  - **Sad** — ACCEPTS (Activity, Contribute, Sensations), Self-Soothe with 5 senses, Butterfly Hug (bilateral tapping)
  - **Angry** — TIPP (Temperature + Intense exercise), Paced Breathing, Wise Mind (feelings + logic)
  - **Bedtime worried** — Worry Time (scheduled worry), 4-7-8 Breathing
  - **Bedtime sad** — Self-Soothe with senses, Butterfly Hug
  - **Bedtime angry** — Progressive Muscle Relaxation, Wise Mind
- **Context-aware check-ins** — wellbeing check-in now appears at 5 key moments: app open (morning), after homework, after quest tasks, after reading, and before bed (7 PM+). Each has contextual titles and tailored prompts.
- **Bedtime-specific responses** — separate response set for evening check-ins with sleep-focused DBT techniques (body scan, progressive relaxation, worry jar).
- **Check-in tracker** — stores completed check-ins per day in localStorage so the child is never asked twice for the same moment.

### Added — Feelings Wheel (Emotional Literacy)

- **"🤔 I don't know how I feel" button** — appears when no mood is selected yet. Opens a simplified two-step feelings wheel based on Plutchik's emotion model, adapted for children.
- **Step 1 — Core question**: "Does it feel more like..." with 5 categories:
  - 🌈 Something good · 🌧️ Something bad · 😰 Something scary · 🌋 Something unfair · 🌀 Something mixed up
- **Step 2 — Sub-feelings with body-based descriptions**: Each core expands into 4–5 specific emotions described through physical sensations and relatable scenarios (e.g. "My brain won't stop thinking about things", "Everyone was looking at me and I wanted to hide").
- Sub-feelings map back to the main emotions (happy/sad/worried/angry/calm/okay) so the correct DBT skill response fires after selection.
- Includes back button and close option — zero pressure to complete.
- Builds emotional vocabulary over time by exposing words like "frustrated", "overwhelmed", "jealous", "grateful", "proud" in context.

### Added — Diary as Dedicated Tab

- **Diary is now a standalone tab** in the bottom navigation (📝 Diary) — no longer hidden under other views.
- **Full diary experience** like opening a physical book:
  - See ALL entries (not just last 7 days), newest first
  - Today's entry always at the top with auto-save
  - Expand any past entry to read it in full
  - **Edit** any past entry (mood + content)
  - **Delete** entries with confirmation prompt
  - **Add entries for past dates** (missed a day? Write it now)
  - Read any entry aloud with TTS
  - Character counter (2000 chars, up from 1200)
  - Added "Proud" and "Okay" mood options
- **"Write in my diary" shortcut** still accessible from Today view for quick access.

## [0.9.0] — 2026-08-09

### Added — Security Guardrails & Parent Safety Net

- **Prompt injection protection** — 15+ regex patterns detect manipulation attempts ("ignore your instructions", "pretend you are", "jailbreak", etc.). Blocked inputs get a friendly child-safe deflection; the original message is never sent to the AI.
- **AI response scanning** — Every AI output is checked against a word blocklist (violence, profanity, drugs, self-harm encouragement, age-inappropriate content) and contextual patterns ("keep secret from parents", "don't tell anyone"). Blocked responses are replaced with a safe fallback. Sentiment scoring rejects highly negative outputs.
- **AI available hours** — Parent-configurable window (default 6 AM–8 PM). Outside hours, the child sees a gentle "rest time" message. Set in Parent Zone → Settings → Safety Guardrails.
- **Daily message cap** — Configurable limit (default 100 messages/day). When reached, the child gets encouragement to go play or read.
- **URL/link detection** — Links in child inputs are detected but allowed through. Each link is logged to the `detected_links` Supabase table and parents are notified via email. The child's experience is uninterrupted.
- **Personal info leakage detection** — Scans child text for phone numbers, email addresses, SA ID numbers, home addresses, and full names. If PII is detected, the message is allowed but parents are immediately notified and the event is logged to `pii_detections`.
- **Image content moderation** — Photos uploaded for chore evidence or profile pictures are checked for file type, size, dimensions, and a skin-tone heuristic. Flagged images are blocked with a friendly message, and parents are notified via email. Events logged to `image_moderation_log`.
- **Session timeout** — Auto-locks after configurable inactivity period (default 15 minutes). Resets on any mouse, keyboard, or touch interaction. Shows a gentle toast notification on lock.
- **Failed PIN lockout** — After 5 failed PIN attempts (configurable), Parent Zone is locked for 15 minutes. An immediate email alert is sent to both parents with attempt count and timestamp. Lockout state persists across app restarts.
- **Device fingerprinting** — On first access from a new device/browser, parents receive an email alert with device details (screen resolution, timezone, language, user agent). Known devices are tracked in `known_devices` table.
- **Mood streak escalation** — Tracks consecutive negative mood check-ins (sad, worried, angry). After 3+ consecutive days, an escalation alert is sent to parents with dates and pattern details — even without distress keywords.
- **Usage anomaly detection** — Monitors for late-night usage (10 PM–5 AM) and usage spikes (50+ interactions in one hour). Anomalies trigger parent email alerts suggesting conversation about screen time or anxiety.
- **Diary sentiment trend** — Rolling 7-day sentiment analysis on diary entries using positive/negative word frequency. A declining trend (score < -0.3 over 3+ entries) sends a soft "heads up" alert to parents.
- **Conversation auto-purge with memory** — Message cap increased to 100 (from 50). Hard 30-day TTL on messages. Before purging, the system extracts and saves a sentiment summary (topics discussed, overall mood, key learnings) so Nomi retains long-term conversational context.
- **Nomi memory context injection** — Past conversation sentiments are injected into Nomi's system prompt so the companion remembers historical topics and emotional patterns even after messages are purged.
- **Export/share confirmation** — All WhatsApp and email share actions now require a confirmation dialog before sending data outside the app.
- **Backup encryption** — AES-256-GCM encryption module using Web Crypto API. Key derived from parent PIN via PBKDF2 (100,000 iterations). Ready for encrypting diary entries and chat history before Supabase sync.

### Changed
- **Parent Zone Settings** — New "🛡️ Safety Guardrails" section with dropdowns/inputs for AI hours (start/end), daily message cap, session timeout, max PIN attempts, and lockout duration.
- **PIN error messages** now show remaining attempts before lockout (e.g. "Incorrect PIN. 3 attempt(s) remaining.").
- **Nomi AI pipeline** now runs: rate limit → injection check → safety check → record usage → API call → response scan → sentiment check → return.
- NomiCompanion message cap increased from 50 to 100 with 30-day TTL and sentiment extraction.

### Architecture
- New `src/services/guardrails/` module with 13 service files covering all security layers.
- New Supabase migration `004_guardrails_tables.sql` adding 8 tables: `detected_links`, `pii_detections`, `image_moderation_log`, `known_devices`, `conversation_sentiments`, `usage_events`, `guardrail_settings`, `pin_access_log`.
- All guardrail tables have RLS policies (parents can view, system inserts) and performance indexes.
- Guardrail settings persisted in localStorage with `explorer_guardrail_settings_v1` key, synced to `guardrail_settings` table when Supabase is live.

## [0.9.0] — 2026-08-09

### Added
- **Weekly Shine & Affirmations tab** — New "Shine" tab in bottom navigation with:
  - Daily reflection fields: "I am proud of...", "I am grateful for...", "An act of kindness...", "Today I...", "My shine goal today"
  - Day-by-day selector (Mon–Sun)
  - Growing Goal This Week field
  - Note From Mom (set by parent, visible to child)
  - Categorised affirmations: I Am Worthy, I Am Brave, I Am Kind, I Am Growing, I Am Blessed
  - Bedtime Affirmation routine
  - Permanent "Special Affirmation From Mommy" section
- **Parent Zone → 💜 Shine tab** — New dedicated section for parents to manage:
  - Weekly Mom's Note (editable, shows in child's Shine tab)
  - Permanent Mommy Affirmation (always visible to child)
  - Growing Goal This Week (sets the child's focus)
- **Parent Point Adjustment** — Give or take away XP with a reason (discipline/reward) in Parent Portal Overview tab
- **WCED 7-Point Grading Scale** (`src/data/wcedScale.ts`) — Maps percentages to official Western Cape levels (1–7)
- **Weekly Completion Percentage** (`src/data/weeklyCompletion.ts`) — Weighted calculation across quests, practice, reading, chores, homework, diary, and shine
- **Enhanced Progress tab** — Now shows:
  - Quest Map understanding tier + star progress bar
  - Weekly engagement metrics (tasks done, diary entries, shine days filled)
  - Vibing project progress (existing)
  - Read-only diary (existing)
- **Full ATP shown in Overview** — All 5 subjects' detailed objectives now display regardless of term (previously limited to Term 4 only)

### Changed
- Bottom nav: Today · Learn · Quest · **Shine** · Read · Diary · Nomi · Store · Parents
- Parent Portal tabs: Overview · Schedule · Content · XP Store · Progress · **💜 Shine** · Alerts · AI · Settings
- Overview tab CAPS section now shows ATP data for ALL terms (not just Term 4)

## [0.9.0] — 2026-08-09

### Added
- **Weekly Shine & Affirmations tab** — New "Shine" tab in bottom navigation with:
  - Daily reflection fields: "I am proud of...", "I am grateful for...", "An act of kindness...", "Today I...", "My shine goal today"
  - Day-by-day selector (Mon–Sun) to fill in per-day entries
  - "Growing Goal This Week" — a weekly focus area
  - "A Note From Mom" — parent-written love note visible to child (editable in Parent Zone)
  - Categorised affirmations: I Am Worthy, I Am Brave, I Am Kind, I Am Growing, I Am Blessed
  - Bedtime Affirmation routine section
  - Permanent "A Special Affirmation From Mommy 💕" message
  - All data persisted in localStorage (`explorer_shine_v1`)
- **Parent Point Adjustment** — In Parent Portal Overview tab, parents can give or take away XP with a reason (discipline/reward flexibility). Shows toast notification with amount and reason.
- **WCED 7-Point Grading Scale** utility (`src/data/wcedScale.ts`) — Maps percentages to Western Cape Education Department levels (1–7: Not Achieved through Outstanding). Ready for use in Quest Map and formal assessments.
- **Weekly Completion Percentage** utility (`src/data/weeklyCompletion.ts`) — Calculates weighted completion across quest stars, practice, reading, chores, homework, and reflections. Visible to both child and parent.

### Changed
- **Homework Assistant** — Removed the "Gemini Key (Optional)" button from child-facing UI. API key now comes silently from parent-configured LLM settings in Parent Zone. Child never sees or interacts with API keys.
- **Reading Companion** — Added day-of-week locking: Story 1 defaults on Mon+Tue, Story 2 on Wed+Thu, both available Fri–Sun. Shows contextual message explaining which story is unlocked today.
- **Today View layout** — Fixed bottom grid: equal columns (`1fr 1fr`), consistent gap, `min-height` on cards so they don't collapse when empty. Cleaner spacing between Life Skills theme and the timeline/chores grid.
- **Bottom navigation** — Now 9 items: Today · Learn · Quest · Shine · Read · Diary · Nomi · Store · Parents

### Architecture
- `src/data/shineData.ts` — Shine state types, affirmation categories, persistence helpers
- `src/data/wcedScale.ts` — WCED 7-point scale with colour codes per level
- `src/data/weeklyCompletion.ts` — Weighted completion calculator with configurable weights
- `src/components/WeeklyShine.tsx` — Full Shine/Affirmations UI component

## [0.8.1] — 2026-08-09

### Fixed
- **Quest Map NaN bug** — Old progress data (from earlier multiple-choice version) stored `starsEarned` instead of `totalStars`. Added migration in `loadQuestState()` that converts old format on load. Stars now display correctly.
- **Quest Map week mismatch** — Previously hardcoded to show "Week 1" when not in Term 4. Now shows actual current week regardless of term.
- **Display name capitalisation** — Profile loader now auto-capitalises the first letter of the display name (e.g. "ufefe" → "Ufefe") so it looks correct in greetings, headers, and the footer.
- **Quest child-friendly language** — Rewrote `buildQuestNodes()` with a `childify()` translation layer that converts raw CAPS topic names into 8-year-old language (e.g. "Whole Numbers — Counting, Ordering & Place Value (0–999)" → "counting and place value"). All scenarios, questions, and hints now speak naturally.

### Changed
- Quest Map questions now use real-world prompts: "Tell me 2 things you remember...", "Give me a real-life example...", "Explain to your 6-year-old cousin..." — not formal curriculum language.
- Quest hints say things like "Think back — what did you do in class?" instead of listing CAPS outcomes verbatim.

## [0.8.0] — 2026-08-09

### Added
- **CAPS ATP Term 4 curriculum data** (`src/data/term4ATP.ts`) — Full 10-week ATP for Grade 3 Term 4 across 5 subjects: Mathematics, English Home Language, Afrikaans FAL, Life Skills, and Coding & Robotics. Each week includes CAPS content area, topic, learning outcomes, activities, and assessment focus.
- **ATP integration across the app**:
  - **Today View** — "This Week's CAPS Learning Focus" card showing all subjects' current-week topics and top learning outcomes.
  - **Practice Zone** — "CAPS Week X Focus" banner showing the active subject's current ATP topic. Now also loads parent-uploaded custom questions from localStorage.
  - **Parent Portal Overview** — Detailed ATP section with full learning outcomes, activities, and assessment focus per subject for the current week.
  - **Homework Assistant** — Gemini prompt now includes current week's ATP context for curriculum-aligned Socratic guidance.
  - **Template Downloader** — Downloaded template dynamically includes the current week's ATP objectives with explicit instructions for LLMs to align all generated content to curriculum. File named by week number.
- **Seed content** (`src/data/term4SeedContent.ts`) — 30+ pre-loaded ATP-aligned practice questions covering all 10 weeks across Maths, English, Afrikaans, Robotics, and Vibing. Auto-seeded to localStorage on first load.
- **Quest Map tab** — New "Quest" tab in bottom navigation. Written-answer evaluation system to test real understanding:
  - 3 progressive checkpoints per subject: Remember (1⭐), Use It (2⭐), Teach It (3⭐)
  - Child writes answers in full sentences — no multiple choice
  - Keyword-based evaluation: Excellent / Good / Developing / Retry scoring
  - Model answers shown after submission
  - Star-based ranking: Emerging → Developing → Secure → Mastery
  - All answers + attempts stored in localStorage (parent-verifiable metric)
  - Questions written in child-friendly language (not CAPS jargon) with `childify()` translation layer
- **Diary privacy guardrail** — Removed all child-visible text mentioning parents can read entries. Now says: "This is your private space. Write whatever you feel — it's just for you. 💜"

### Changed
- Bottom nav: Today · Learn · Quest · Read · **Diary** · [Companion] · Store · Parents
- Template file now named `explorer-content-template-week{N}.md` for weekly context
- Practice Zone uses both built-in PRACTICE_BANK and parent-uploaded custom questions merged together

### Architecture
- `getATPWeek(week)` / `getATPBySubject(subject)` / `getLearningOutcomes(week, subject)` utility functions for any component to access ATP data
- Quest Map progress persisted in localStorage under `explorer_quest_map_v1` with full written answers, timestamps, and star counts
- `seedTerm4Content()` runs once at app init to populate practice questions if localStorage is empty

### Added
- **Vocab Book** — floating 📖 button accessible from any tab. Add words with meaning, example sentence, and language (English, Afrikaans, isiZulu). Each word stamped with current term + week number. Search/filter, delete. `getWrappedStats()` function ready for end-of-term Spotify-Wrapped-style infographic.
- **Vocab Supabase table** — `002_vocab_table.sql` migration with child ownership RLS and parent read-only access. Sync engine has `syncVocab()` ready.
- **Thematic content framework** — Life Skills weekly theme is now the creative lens for ALL subjects. LLM Dashboard prompt includes the theme and instructs AI to align recommendations. Template downloader includes explicit thematic philosophy with examples.
- **`themeTag` field on PracticeQuestion** — allows tagging and filtering questions by weekly theme for cohesive content delivery.
- **Theme-aware BYOK AI** — the parent's AI assistant now receives term, week, theme, subjects, and objectives in every prompt, with instructions to align all suggestions to the current weekly theme.

### Changed
- Template downloader now includes "CRITICAL — THEMATIC CONTENT APPROACH" section explaining that all LLM-generated content must be flavoured by the weekly Life Skills theme, with subject-specific examples.
- README rewritten to lead with the thematic philosophy and document all current features.

### Fixed
- Removed broken `QuestMap.tsx` component (incomplete sub-agent output causing dev server parse errors).

## [0.6.0] — 2026-08-09

### Added
- **Supabase connected** — client SDK installed, sync engine created, migration applied to project `gbjkockgfntgctchkzdk`. Tables: profiles, schedule_items, chores, diary_entries, nomi_messages, nomi_memory, xp_wallets, store_items, store_purchases, parent_alerts, family_settings. Full RLS policies and indexes.
- **Dev/demo mode** — `DEV_MODE = true` in syncEngine.ts disables all remote Supabase writes. localStorage works normally. Flip to `false` to go live.
- **20-minute reading stories** — two ~2800-word South African stories for Term 3 Week 4 ("The Dancing Shadows of Durban" and "Naledi and the Music Box"). Locked day progression with different comprehension questions per day pair.
- **Vibing term project** — "Build My Dream App" with 10 weekly milestones covering design thinking through presentation. Age-appropriate descriptions, parent update summaries, XP rewards.
- **Robotics + Vibing subjects** added to Practice Zone (6 questions each).
- **Term/week/date banner** — persistent display across all tabs showing current date, week of term, and CAPS Life Skills weekly theme.
- **CAPS ATP data** — 40 weeks (4 terms × 10 weeks) of Life Skills themes with subjects and objectives.
- **Content template system** — "Download Template" (markdown with LLM formatting instructions) and "Upload Content" (JSON import for schedule, chores, stories, questions, objectives) in Parent Zone Settings.
- **CAPS weekly objectives** displayed in Parent Zone Overview tab.
- **Term project data layer** with localStorage persistence (`projectData.ts`).

### Changed
- **BYOK API key centralised** — LLM config (provider + key) is now managed exclusively in Parent Zone Settings. The AI assistant tab no longer asks for its own key; it receives it from the parent-managed config.
- **Parent Zone auto-relocks** on every close (PIN re-entry required).
- AI companion tab in bottom nav now shows the custom name chosen during setup.
- Floating companion bubble uses the child's avatar/emoji and persists across all tabs.

### Architecture
- Offline-first: all data reads/writes go to localStorage first. Supabase sync runs in background when `DEV_MODE = false` and connection is available.
- Nomi memory extraction: when online with a Gemini key, the sync engine can extract facts (favourites, events, preferences) from conversations and store them in the `nomi_memory` table for long-term recall.

## [0.5.0] — 2026-08-08

### Added
- **Share everywhere** — Ufefe can share wins via WhatsApp or email from Today (chore completions), XP Store (purchases), Badges (unlocked achievements), Nomi (chat moments), and Practice Zone (correct answers). All messages signed "— sent from Explorer AI 🚀".
- **Floating AI companion bubble** — the companion avatar/emoji persists as a floating button across all tabs (hidden when already on the companion tab). Tapping it opens the chat instantly.
- **BYOK AI Dashboard** in Parent Zone (🤖 AI tab) — parents enter their own Gemini, OpenAI, or Claude API key. The dashboard passes app context and answers questions about learning patterns, schedule ideas, and recommendations.
- **Visual colour picker** in schedule manager — preset swatches with selected ring + native browser colour wheel + hex code input.
- **PIN update** — Parent Zone Settings now allows changing the portal PIN (min 4 characters, persisted locally).
- **Parent Zone auto-relocks** every time it is closed; PIN re-entry required each session.
- **Diary moved under Progress** tab in Parent Zone alongside XP/level/streak/task stats.
- **Custom companion name** — the bottom nav tab now shows the name chosen during setup (e.g. "Nomi", "Star", "Zuki").
- **Nomi conversation persistence** — chat history saved to localStorage between sessions (up to 50 messages).
- **First-run setup wizard** — on fresh install, guides through name, avatar, and companion name selection.
- **Spotify quick-launch** — green floating button opens Spotify app/web in a new tab.
- **Supabase migration** at `supabase/migrations/001_initial_schema.sql` — full schema with profiles, schedule, chores, diary, Nomi messages, Nomi memory, XP wallets, store items, purchases, alerts, and family settings. Includes Row-Level Security policies and indexes.
- **Tooltips** on all Parent Zone buttons and interactive elements.
- **XP Store** — child-facing reward store + parent catalogue manager (photos, stock, pricing).

### Changed
- Parent Zone PIN has always been updateable in Settings; legacy demo PIN defaults were removed from the public runtime and schema.
- Bottom nav is now: Today · Learn · Read · [Companion name] · Store · Parents.
- Portal tabs now include emojis: 📊 Overview · 📅 Schedule · 🎁 XP Store · 📈 Progress · 🚨 Alerts · 🤖 AI · ⚙️ Settings.
- XP system uses dual wallet: `balance` (spendable) vs `lifetimeEarned` (used for level/badges). Spending does not reduce level.
- README rewritten to document current architecture, BYOK dashboard, Supabase readiness, and deployment.

### Fixed
- Nomi tab crash (useEffect render loop) — added `useRef` guard for greeting.

### Added
- **Today** landing screen with schedule timeline, next-event card, task completion, XP/confetti, and notification permission prompt.
- **Schedule and chore management** in Parent Zone, including weekly events, configurable reminders, email flags, and copy-day controls.
- **Nomi 🌟** child-safe companion with offline responses, optional Gemini integration, voice input, quick replies, XP rewards, and urgent parent alerts.
- **Learner personalisation** for display name, avatar/profile photo, skin, and background; uploaded photos are EXIF-scrubbed locally.
- **Diary narration** using device-native speech synthesis. The app prefers installed `en-ZA` voices and natural/high-quality English voices.
- **GitHub Pages workflow** at `.github/workflows/deploy.yml`; Vite now uses relative asset paths.
- A standalone `CHANGELOG.md`; release history is no longer embedded in the README.

### Changed
- Mobile navigation is now **Today · Learn · Read · Nomi · Parents**. Homework and Practice are sub-tabs under Learn.
- Parent email settings persist locally and feed simulated reminder/wellbeing email payloads.
- Diary policy changed: Dad and Mom have a locked, **read-only** Parent Zone view. They cannot edit, delete, export, or share entries, and diary content remains excluded from reports and WhatsApp shares.
- README rewritten to reflect actual storage, TTS, GitHub Pages deployment, privacy limitations, and the recommended backend path.

### Security and data notes
- There is currently **no hosted database**. Schedule, chore, diary, profile, and email-setting data remains in browser `localStorage` for one browser profile/device.
- GitHub Pages deployment is static hosting only; it does not provide shared family data, secure login, real email delivery, or secret management.
- `VITE_GEMINI_API_KEY` must not be exposed in a public GitHub Pages deployment.

## [0.3.0] — 2026-08-08

### Added
- EXIF metadata scrubber for uploaded homework/profile photos.
- IndexedDB offline helper, child-safety scanner, simulated parent email payloads, Grade 4 curriculum, grade selector, and six-week story bank.

### Changed
- Parent Portal received a simulated Google/PIN gate and configurable email UI.
- Reading and homework flows gained expanded offline/safety support.

## [0.2.0] — 2026-08-08

### Added
- Parent Portal, wellbeing notification feed, badges modal, WhatsApp progress share, downloadable parent report, and mobile bottom navigation.

## [0.1.0] — 2026-08-08

### Added
- Vite + React + TypeScript foundation, CAPS practice content, Socratic homework guidance, reading companion, wellbeing check-in, sound effects, and initial text-to-speech support.
