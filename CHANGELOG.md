# Changelog

All notable changes to Conquerer are recorded here. The project uses an adapted [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

## [Unreleased]

### Added — full-page Parent Zone and protected multi-provider AI beta

- Parent Zone is now a dedicated full-page workspace rather than a modal. It preserves adult-only role checks, hosted PIN enrollment/recovery, unsaved Settings protection, sign-out, and a deliberate **Open Child App** transition that unmounts and relocks the portal.
- Added `023_family_llm_provider_settings.sql` and a Parent Zone AI configuration flow for Gemini (default), OpenAI, or Claude. A parent may set an optional provider model and Nomi personality/style guide. Provider keys are submitted once to an authenticated parent-only RPC, stored in Supabase Vault, and never returned to the browser; the style guide is layered beneath fixed child safety, privacy, and homework rules.
- Reworked the protected `ai-chat` source for role-separated channels: children may use Nomi/Homework, parents may use Parent/Memory. It validates per-channel request shapes, limits Nomi input/history, uses server-owned prompts, checks membership before quota consumption, and preserves server-authoritative Johannesburg quota/cooldown/override enforcement.
- Added provider-side and server-side child protection: prompt-injection and private-data/link filtering, deterministic urgent-safety handling, Gemini harm settings, bounded child output, and output safety checks. In hosted mode a provider failure is shown honestly and never replaced by a canned answer; small static replies are offline-only.
- Removed persisted browser provider-key configuration from the app. Parent dashboard requests now use the protected gateway; the existing `GEMINI_API_KEY` Function secret remains the default only until a parent deliberately configures a family provider key.
- Modernised Nomi’s opening, offline copy, status feedback, and client response filter to avoid repetitive/corny replies and false-positive substring blocking.

### Added — safe 15-minute active-session sync and child customisation

- Added a single-flight hosted sync cycle while the browser is open, visible, and online: at startup, every 15 minutes, and on reconnect/focus. Child diary entries, Nomi messages, learning evidence, and vocabulary use upsert-only sync before remote state is refreshed. The timer deliberately excludes schedules, chores, wallet, and store snapshots so stale devices cannot delete or overwrite newer records; it cannot run reliably after the browser is closed or background-suspended.
- Added migration `021_safe_child_profile_customization.sql`. Its security-definer RPC allows only the authenticated linked child to update a constrained display name, avatar, skin, background, and AI companion name; it cannot alter family membership, role, ownership, photos, or voice settings.
- Added a child customisation field for the AI companion name. Profile photos and chosen voice remain device-local.

### Added — interactive Vocab Book dictionary lookup

- English word input now looks up a short meaning automatically after a brief pause or through **Find meaning**, optionally supplies an example, and leaves the learner free to edit either value before saving.
- Successful lookups use a bounded 200-entry, 90-day device-local cache. Saved learner vocabulary is synchronized through `vocab_words`; the lookup cache and a bulk dictionary dataset are never written to Supabase.
- Afrikaans, isiZulu, other languages, and offline/unknown lookups retain the manual-entry path.
- No Oxford dictionary content is seeded, copied, or cached. A future Oxford provider must use an appropriate licence and a server-side credential integration; see the [Oxford API terms](https://developer.oxforddictionaries.com/api-terms-and-conditions).

### Changed — Nomi curiosity chat and Socratic homework are distinct

- Nomi now answers ordinary child-safe curiosity questions directly and briefly. It uses Socratic guidance only when the learner clearly identifies the question as assigned homework, a worksheet, a test, or schoolwork; the dedicated Homework Assistant remains the explicit step-by-step Socratic path.

### Added — child AI quota notice and one-day parent increase

- Added migration `019_child_ai_quota_alerts_and_daily_overrides.sql`, a server-authoritative 95% threshold for the applicable enforced child total, Nomi, or homework allowance. It creates exactly one family/child/Johannesburg-day claim, never alerts for parent or memory use, and leaves durable guardrail defaults unchanged.
- Added Parent Zone → Settings controls for a linked child’s Johannesburg-day-only total/Nomi/homework increase. The server rejects direct table access, unlimited-cap overrides, decreases (including a decrease from an earlier same-day increase), and ambiguous multi-child targeting; the current one-child UI fails closed rather than choosing a child arbitrarily.
- Added a fixed, internal-only `send-parent-alert` quota route. It derives parent recipients from family contact settings, sends a fixed “sign in to increase today’s limit” message, atomically reserves claims to avoid duplicate sends, records provider failures, and exposes only a fixed protected retry request. `AI_QUOTA_ALERT_INTERNAL_TOKEN` is required as a matching Function-only secret in `ai-chat` and `send-parent-alert`.

### Added — remaining reviewed 2026 learning-calendar coverage

- Added migration `020_seed_remaining_2026_learning_calendar_weeks.sql` for Term 3 Weeks 5–10 and Term 4 Weeks 1–10. The seed supplies explicit reviewed curriculum topics/outcomes to the weekly research Function and stops the final rows at the repository’s declared 2026 term ends (25 September and 11 December). It is reference data, not user data.

### Added — secure Google-reauthenticated PIN recovery

- Added migration `018_google_reauth_portal_pin_recovery.sql` plus hosted UI/service flow for app-PIN recovery without Supabase email/password reset. A parent starts a short-lived reset challenge, is signed out, completes a fresh Google OAuth login with `prompt=login`, and then chooses a new 4–12 digit Parent Zone PIN.
- The raw re-auth challenge is generated server-side, returned once to the current browser, retained only in `sessionStorage` during the OAuth return, and stored in Postgres solely as a SHA-256 hash. It is never placed in a URL, localStorage, email, database plaintext field, or application log. The server checks Google identity, matching family/parent profile, expiry, single use, and `auth.users.last_sign_in_at` after challenge creation before accepting a reset.
- Added child personal-PIN reset requests. Only the authenticated child can request their own reset; only a parent in the same family can list/cancel it; approval requires that parent’s fresh Google re-authentication and writes only a bcrypt hash of the chosen replacement PIN. The requester, target profile, and request rows are locked/scoped server-side to resist cross-family and concurrent approval mistakes.
- Replaced the Google-only incompatible “send recovery email” UX. Hosted child profile settings now request parent approval instead of directly replacing a credential. Parent Zone retains ordinary parent PIN updates and first-use enrollment.

### Added — teaching videos, answer evidence, and report-research foundations

- Added reviewed YouTube lesson metadata and varied activity formats through migration `016_practice_question_teaching_videos.sql`. New imported questions require a valid, parent-reviewed YouTube lesson; Practice Zone shows it above answer controls and unlocks the activity when the embedded lesson reports completion. Existing built-in questions without lesson metadata remain usable during transition.
- Added multiple-choice, missing-field, question-and-answer, and connecting-field practice support. Final learner answers are retained in the protected `learning_performance_events.answer` field with the usual score, correctness, hint, retry, and timestamp evidence.
- Added immutable Johannesburg daily aggregate snapshots and parent-reviewable native Gemini weekly content-research drafts through migration `017_learning_report_snapshots_and_research_drafts.sql` and two protected Edge Functions. Snapshots exclude answers, diary text, messages, contacts, and raw metadata; weekly research may use bounded English/Afrikaans answer evidence for trend detection but is prohibited from quoting it or forwarding it to the parent-research handover.
- Weekly planning uses the calendar-owned scheduled target week (never `week + 1`), all supplied target outcomes, 60% core / 35% evidence-led opportunity / 5% optional stretch, required Introduce → Guided Practice → Independent Practice → Mastery Check progression, and teaching-video plans. It never invents sources or URLs; parent review remains required. A no-suitable-video fallback is a one-to-two-minute visual-lesson brief only—automatic video generation is not implemented.
- Added dedicated Resend sender-secret handling for welcome, alerts, daily recaps, and weekly recaps; raised the protected parent AI output allowance for planning detail.

### Verified — production release, Vault schedules, and clean first-user state

- Migrations 016–020, the reviewed `ai-chat`, `send-parent-alert`, `send-parent-reports`, snapshot, weekly-research, and invitation Functions are active in production. GitHub Pages successfully deployed commit `3cea5f5`; the live Pages URL returned HTTP 200.
- Rotated the four private scheduler tokens and set matching production Function Secret and Vault values without exposing or committing any value. Five active `pg_cron` jobs use `pg_net` and `vault.decrypted_secrets` only: daily and Saturday reports, daily snapshots, Saturday research, and 15-minute child-AI alert retries.
- Ran one protected no-family invocation for each endpoint. Reports returned `sent: 0`; snapshots/research created no records; and alert retry found no claims. These checks did not send email or invoke Gemini for a family.
- Performed the reviewed dependency-aware production reset without `TRUNCATE … CASCADE`. All family/user/content public tables, `auth.users`, and `auth.identities` verified at zero; Storage had zero objects/buckets. Schema, migrations, RLS/RPCs, provider/Function configuration, Function/Vault secrets, and 18 reviewed learning-calendar reference rows were retained.
- The Resend sending domain is verified. Real welcome-email delivery and parent/child Google invitation redemption remain deliberately untested until an authorised real recipient is selected. Users must still clear old Pages site data before bootstrap.

### Fixed — first hosted Parent Zone PIN enrollment

- Removed the first-use deadlock in hosted Parent Zone: when no bcrypt-backed PIN exists for the authenticated parent profile, the submitted valid 4–12 digit PIN is now securely enrolled through `set_portal_pin(...)` and unlocks Parent Zone. Existing configured-PIN verification and offline fallback behaviour remain unchanged.
- Clarified the first-use Parent Zone prompt and README guidance so the parent knows their initial hosted PIN submission creates the credential.

### Documented — aligned QA baseline

- Added invitation-only, Google-authenticated family onboarding in source: migration `014_family_invitations_google_onboarding.sql` creates server-managed invitations and family administrators; Parent Zone separates invitation management from notification recipients; `send-family-invitation` delivers opaque single-use welcome links through Resend; and `AuthGate` redeems the invitation before fail-closed family setup.
- The bootstrap Google account `thedfamily0@gmail.com` creates the first family administrator. Parent and child accounts must use the exact invited Google account; contact email settings cannot grant access.
- Recorded the source-versus-hosted-evidence boundary: repository code and migrations can be inspected locally, but deployment state, Edge Function secrets, Resend sender verification, hosted cron jobs, and email delivery require independent hosted verification.
- Reclassified parent reports as **source partial/open**: local-time due checks and report-date filtering are present, while the learning-event fetch still uses a rolling UTC millisecond window instead of a clean configured local-calendar boundary.
- Recorded that the learning streak currently reparses localStorage on every app render and uses UTC/ISO dates, while the XP cap uses the Africa/Johannesburg calendar boundary.
- Retained the high-risk offline limitations: Parent Zone access is not role-separated offline, and the fallback portal PIN is stored in plaintext browser storage.
- Replaced the migration-013 source onboarding blocker with migration 014's administrator invitation UI and Google-account redemption flow. Production migrations, OAuth, Pages configuration, and the invitation Function are now present; actual invitation delivery and parent/child redemption remain untested. The diary privacy contradiction, rejected PII scanner copy, physical-device/mobile QA, and report-delivery/scheduler QA remain open.

### Validation boundary

- The source QA baseline is now supplemented by limited hosted evidence: Pages configuration, the active invitation Function and its origin/RPC path, verified sender-domain status, and a reset/retained-object check. It does not assert real invitation/report delivery, active report cron jobs, configured recipients, or cross-device XP behavior. Do not send production report smoke tests.

## [1.2.2] — 2026-08-09

### Fixed — audit remediation and hosted safety boundaries

- Decoupled authenticated parent alerts from the optional AI-chat flag and redacted recipient details from browser logs.
- Added durable activity keys for hosted XP claims so retries reuse one server-side client ID; the source RPC implements the atomic Johannesburg-calendar 100 XP cap and ad-hoc XP remains outside it.
- Hosted PIN mode now fails closed for unavailable verification or failed profile PIN updates; offline-only mode is explicitly a convenience fallback.
- Added bounded mobile voice loading retries, warmed profile voice previews, and kept Afrikaans speech restricted to `af-*` voices with `af-ZA` language fallback rather than an English voice.
- Reworked the child wellbeing support card and responses into calm, short steps without alarming alert styling or unsafe breath-holding/ice instructions. Modal check-ins can be dismissed before a mood is selected.
- Added edit/delete controls for historical school results and SMART goals, plus remote performance-event hydration for the Parent Zone dashboard.
- Added migration `012_security_followups.sql` locally. It requires review and hosted application; no hosted database mutation was made in this remediation batch.
- Made `ensure_family_setup` fail closed for accounts absent from `family_members`; contact email arrays are no longer treated as an authorization grant. Added migration `013_family_access_fail_closed.sql` for already-migrated hosted projects.
- Fixed homework gateway JSON extraction and ATP prompt line breaks, removed duplicate Nomi quota accounting, passed hydrated parent recipients into Nomi alerts, and removed false perfect homework scores from academic evidence.
- Replaced the hardcoded three-day streak with a derived learning streak, corrected Johannesburg mood/late-night date handling, and required stable activity keys for wellbeing XP retries.

### Validation boundary

- Physical iOS/Android speech QA and authorized report delivery remain pending. Do not send a production report smoke test; use a non-production recipient configuration.

### Added — hosted learning intelligence, atomic XP, and parent reports

- Added Parent Zone historical school/end-of-term result tracking, SMART goals, subject trends, gap priorities, and a conservative content game plan that prioritises confident current-grade mastery before optional above-grade extension.
- Added migration `011_learning_results_reports_xp.sql` for parent-only school results/goals/report settings, hosted learning-event fallback creation, and an atomic `claim_learning_xp(...)` RPC. Authenticated devices share the intended Johannesburg-calendar 100 learning-XP cap; ad-hoc chores remain outside the cap.
- Added `send-parent-reports`, a server-side daily recap and Saturday weekly strategy Edge Function. It reads `RESEND_FROM_EMAIL` (intended production sender: `alerts@getonlinefast.xyz`), sends only Dad email 1 and Mom email 1, excludes diary text, and deduplicates deliveries. The intended schedule is one daily report at 20:30 and one Saturday report at 13:00 in `Africa/Johannesburg`.
- Added three child-selectable device-native TTS personalities — Sunny, Calm, and Storyteller — with Afrikaans practice explicitly routed through `af-ZA`, safe browser fallback, and device-local preference.
- Expanded the achievement gallery to fourteen curiosity, persistence, exploration, wellbeing, and learning milestone badges. The copy celebrates effort, retries, and growing ideas rather than perfection.
- Added mobile-first layout refinements for narrow navigation, stacked hero controls, compact headers, accessible zoom, and phone-safe touch targets. GitHub Pages serves one responsive URL for both phone and desktop; separate mobile/desktop URLs are unnecessary unless separate markup is later desired.

### Validation boundary

- Local validation must be rerun for the release commit. The current QA review verified source behavior but did not independently verify hosted migrations, `send-parent-reports`, cron jobs, sender verification, provider secrets, delivery, or the hosted XP RPC. Browser runtime checks on physical phone sizes and device speech engines remain rollout QA.

## [1.2.0] — 2026-08-09

### Added — role-separated portals, daily XP cap, and secure settings

- Learning XP is capped at 100 XP per local calendar day across Homework, Practice, Reading, Quest, Vibing, Nomi, and wellbeing activities. Ad-hoc chores, purchases, and parent adjustments remain outside that cap, and partial/full-cap feedback is shown in the child app.
- Email recipients now use an explicit draft → Save/Discard flow. Hosted settings are written server-first; the previous recipients remain active when a save fails, and the UI confirms the result.
- Hosted sessions now use authenticated `family_members.role` to hide Parent Zone from child accounts. Adult sessions open Parent Zone natively and can explicitly choose **Open Child App**.
- Child-visible sharing controls and parent-notification/data-sharing copy were removed. Safety detection and backend alerts continue silently through the authenticated Edge Function.
- Added migration `010_access_roles_and_portal_pins.sql` with adult email approval, `get_my_access_context()`, bcrypt-backed per-profile PIN credentials, and lockout-aware verification. Google-only PIN recovery and parent-approved child reset are added later in migration 018; they do not use Auth password reset.
- Deployed `send-parent-alert` version 24. Child-originated alerts can now resolve Dad/Mom recipients server-side through the service-role contact lookup; provider secrets remain Supabase Function Secrets.

### Validation

- `npm run build` passes.
- `npm run lint` passes with only the four existing Fast Refresh warnings in `WellbeingCheckin.tsx`.
- `git diff --check` passes.
- Hosted migration objects `portal_pin_credentials`, `get_my_access_context()`, and `verify_portal_pin(text)` were verified; `send-parent-alert` is active at version 24.

## [1.1.9] — 2026-08-09

### Verified — Authenticated parent email delivery

- Verified the production Resend sender `alerts@getonlinefast.xyz` through the Supabase `send-parent-alert` Edge Function.
- Confirmed GitHub Pages builds use authenticated Supabase sync and the secure AI gateway; the public build contains no Resend provider secret.
- Ran an authenticated live Nomi distress smoke test with “I do not feel safe”: the Edge Function returned HTTP `200` with `sent: true`, and Resend reported the alert as **delivered** to all four configured parent recipients.
- Audited the other email triggers: emotional check-ins, URL/PII detections, flagged photo evidence, new-device alerts, PIN lockouts, mood streaks, usage anomalies, diary sentiment trends, and opted-in schedule reminders all use the same `sendParentEmailAlert()` → `requestParentEmailAlert()` → `send-parent-alert` path.
- Confirmed the browser never calls Resend directly; the provider API key and sender remain Supabase Function Secrets.
- The live test also exposed an unrelated `nomi_messages` sync uniqueness warning; the parent alert sync row and email delivery succeeded independently.

## [1.1.8] — 2026-08-09

### Clarified — User-ID-based family administration

- Defined `thedfamily0@gmail.com` as the initial bootstrap administrator, **User #1**.
- Clarified that User #1 approves/adds other people by storing their authenticated Supabase `auth.users.id` in family membership records.
- Clarified that email addresses are lookup/invitation values only; they are not authorization grants.
- Defined future child access as an approved child user ID resolving automatically to its linked family and child profile.
- Documented that the admin capability, membership-management UI, child-user linking, and automatic profile selection remain implementation work.

## [1.1.7] — 2026-08-09

### Documented — Parent-approved family onboarding journey

- Recorded the required Startup Wizard journey: open the Conquerer link, create the child profile, then land the parent in **Parent Zone → Settings**.
- Defined parent approval/whitelisting for parent and child email identities before hosted family access is granted.
- Defined future child login behavior: an approved child email automatically resolves to the linked child profile and family-scoped data.
- Added the required security boundary: an unapproved child email cannot create or access a family profile.
- Marked the Settings whitelist UI, child-email linking, and automatic child-profile selection as remaining implementation work rather than claiming they are already live.

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
