# Shortlisted — Task State

## Status: All pre-launch code complete — blocked on domain purchase + Railway deploy

---

## Completed

### Scaffold (Day 1)
- [x] Full project scaffold — src/lib, src/middleware, src/routes, src/services
- [x] Prisma schema — Job model, Tier + JobStatus enums
- [x] React/Vite frontend — UploadView, ProcessingView, SuccessView
- [x] scripts/test-chain.js smoke test
- [x] package.json, railway.toml, .gitignore

### Claude chain (Day 2)
- [x] MOCK_CLAUDE=true bypass for dev without API credits
- [x] Claude JSON retry — strips markdown fences, retries once with stricter prompt
- [x] Double-failure path — marks job FAILED, sends failure email to user

### Payment (Day 3)
- [x] Replaced Stripe with Lemon Squeezy (Panama compatibility)
- [x] SKIP_PAYMENT=true dev mode — bypasses checkout, fires analysis immediately
- [x] Webhook handler — HMAC-SHA256 signature verification, order_created event

### Pre-launch hardening (Day 3)
- [x] Input truncation — resume capped at 6,000 chars, JD at 4,000 chars
- [x] PDF empty guard — rejects if extracted text < 200 chars with PDF_EMPTY error code
- [x] Webhook idempotency — atomic updateMany (prevents duplicate runs on webhook retry)
- [x] R2 signed URL — 72h expiry set at job completion
- [x] Puppeteer memory — --max-old-space-size=512 in Railway startCommand
- [x] Rate limiting — express-rate-limit on POST /api/jobs (5 req / IP / 10 min)
- [x] Error emails — sendFailureEmail() in analyseJob catch block
- [x] Health check — GET /api/health returns { status: 'ok', db: 'connected' }
- [x] Environment parity guard — server refuses to start if MOCK_CLAUDE or SKIP_PAYMENT=true in prod

### Design + rename (Days 4–5)
- [x] Gen-Z redesign — bold typography, gradient accents, hero section
- [x] Pricing: The Audit $12 / The Glow-Up $29
- [x] Email templates — branded, card layout, good copy
- [x] PDF report header — tier labels
- [x] Full local E2E test — real PDF, COMPLETE state, R2 upload, Resend email confirmed

### Launch prep + market readiness (Day 6 code)
- [x] i18n — en + es-419, LangSwitcher top-right, browser auto-detect, localStorage persist
- [x] All UI strings translated (UploadView, PreviewView, ProcessingView, SuccessView, NotFoundView)
- [x] Email capture at upload — email stored on job creation, enables nurture sequence
- [x] Preview nudge email — PREVIEW_READY jobs 2h+ with email → ATS score + first gap CTA
- [x] Follow-up email sequence — day 3 and day 7 (existing, unchanged)
- [x] Blurred rewrite teaser on PreviewView — before/after bullet, blur on "after" side
- [x] Urgency strip on PreviewView paywall — accent banner
- [x] SuccessView referral — copy link + LinkedIn share button, clipboard bug fixed
- [x] Sample report — regenerated as BASIC tier (no rewrites revealed)
- [x] Hero sample link — "See a real sample report →" below primary CTA
- [x] Mobile touch detection — "Tap to upload" vs "Drop here" based on ontouchstart
- [x] Privacy note — shown only after file is selected
- [x] Blog — 3 long-form posts: ATS systems, resume keywords, software engineer resume
- [x] Blog nav link in hero nav
- [x] Sitemap updated with blog URLs (priority 0.9, lastmod 2025-04-13)
- [x] Blog routes in App.jsx
- [x] Cost tracking + analytics dashboard (/admin)
- [x] Prisma schema: previewNudgeSentAt, followUp1SentAt, followUp2SentAt fields

### Quality improvements (post-launch feedback)
- [x] Fix email double-ask: status endpoint returns email, PreviewView pre-fills it
- [x] Rewrite prompt: outcome-first bullets, 7 weakest bullets (was 5), no em dashes, inject keyword gaps, infer metrics, structural transformation required
- [x] CV PDF redesigned: two-column layout, navy header, orange accent, bullet character, comma-separated skills, attribution footer
- [x] Salary section: shows monthly AND annual figures

---

## Blocked — manual actions required

### Domain (do first — unlocks everything else)
- [x] Purchase getshortlisted.fyi and point DNS to Railway

### Railway deploy
- [x] Push to GitHub (or it's already there — confirm)
- [x] Connect repo in Railway dashboard
- [x] Add all production env vars (see .env.example)
- [x] Set CRON_SECRET env var (any long random string)
- [x] Set ADMIN_SECRET env var (any long random string)
- [ ] Set MOCK_CLAUDE=false, SKIP_PAYMENT=false
- [x] Confirm /api/health returns { status: 'ok', db: 'connected' }
- [ ] Run live end-to-end test with real Lemon Squeezy test purchase

### After domain is live
- [x] Replace G-XXXXXXXXXX in client/index.html with real GA4 measurement ID
- [x] Set up cron-job.org: POST https://getshortlisted.fyi/api/cron/followups hourly, header X-Cron-Secret: <CRON_SECRET>
- [x] Set up Google Search Console + verify domain
- [x] Verify getshortlisted.fyi in Resend dashboard (domain verification)
- [x] Update Lemon Squeezy webhook URL to https://getshortlisted.fyi/api/webhooks/lemonsqueezy
- [ ] Set STATS_SEED in Railway env once real completed jobs exist
- [ ] Drop daniel.jpg into client/public/images/daniel.jpg
- [ ] Screenshot og-template.html at 1200x630 → save as client/public/og-image.png

### Lemon Squeezy (manual)
- [ ] Sign up at app.lemonsqueezy.com
- [ ] Create "The Audit" ($12) and "The Glow-Up" ($29) products
- [ ] Copy Variant IDs → LEMONSQUEEZY_VARIANT_ID_BASIC / _FULL
- [ ] Copy Store ID → LEMONSQUEEZY_STORE_ID
- [ ] Create API key → LEMONSQUEEZY_API_KEY
- [ ] Add webhook (order_created) → copy signing secret → LEMONSQUEEZY_WEBHOOK_SECRET

---

## Backlog (v1.1)
- [ ] LinkedIn About section rewrite in Full tier
- [ ] 3-pack bundle: 3 analyses for $25 (credit system)
- [ ] Job description URL input (Jina AI reader API: r.jina.ai/{url})
- [ ] Referral discount code on success page
- [ ] 30-day re-engagement email

---

## Critical constraints — never violate
- Webhook handler responds 200 in < 5s — analyseJob() is always fire-and-forget
- analyseJob() atomic idempotency via updateMany — not read-then-write
- MOCK_CLAUDE and SKIP_PAYMENT must be false in production (enforced at startup)
- Input truncation: resume ≤ 6,000 chars, JD ≤ 4,000 chars
- Never use em dashes in UI copy or AI-generated content
