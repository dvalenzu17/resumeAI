# Shortlisted — Task State

## Status: Day 5 complete — renamed to Shortlisted, pricing updated, emails upgraded, ready for Day 6 (Railway deploy)

---

## Completed

### Scaffold (Day 1)
- [x] Full project scaffold — src/lib, src/middleware, src/routes, src/services
- [x] Prisma schema — Job model, Tier + JobStatus enums
- [x] React/Vite frontend — UploadView, ProcessingView, SuccessView
- [x] scripts/test-chain.js smoke test
- [x] package.json, railway.toml, .env.example, .gitignore

### Claude chain (Day 2)
- [x] MOCK_CLAUDE=true bypass for dev without API credits
- [x] Claude JSON retry — strips markdown fences, retries once with stricter prompt
- [x] Double-failure path — marks job FAILED, sends failure email to user

### Payment (Day 3)
- [x] Replaced Stripe with Lemon Squeezy (Panama compatibility)
- [x] SKIP_PAYMENT=true dev mode — bypasses checkout, fires analysis immediately
- [x] Webhook handler — HMAC-SHA256 signature verification, order_created event

### Pre-launch hardening (Day 3)
- [x] Input truncation — resume capped at 6,000 chars, JD at 4,000 chars (in analyser.js)
- [x] PDF empty guard — rejects if extracted text < 200 chars with PDF_EMPTY error code
- [x] Claude double-failure — job marked FAILED, failure email sent to user
- [x] Webhook idempotency — analyseJob() skips if status is PROCESSING or COMPLETE
- [x] R2 signed URL — 72h expiry set at job completion (uploadReport returns signed URL)
- [x] Puppeteer memory — --max-old-space-size=512 added to Railway startCommand
- [x] Rate limiting — express-rate-limit on POST /api/jobs (5 req / IP / 10 min)
- [x] Error emails — sendFailureEmail() called in analyseJob catch block
- [x] Health check — GET /api/health returns { status: 'ok', db: 'connected' }
- [x] Environment parity guard — server refuses to start if MOCK_CLAUDE=true or SKIP_PAYMENT=true in production

### Design (Day 4)
- [x] Gen-Z redesign — bold typography, gradient accents, hero section
- [x] Tier rename — "The Audit" ($9) / "The Glow-Up" ($19)
- [x] Copy rewrite — professional with 5% personality

### Database & local E2E test (Day 4)
- [x] Neon DATABASE_URL already in .env — prisma generate + db push complete
- [x] Backend on :3000, frontend on :5173 (Vite proxy /api → backend)
- [x] Full E2E with real PDF: job COMPLETE in ~3s, PDF in R2, email via Resend
- [x] Idempotency: duplicate analyseJob() on COMPLETE job skips correctly

---

## Next Steps

### Day 3 — Complete Lemon Squeezy integration
- [ ] Sign up at app.lemonsqueezy.com
- [ ] Create "The Audit" ($9) and "The Glow-Up" ($19) products
- [ ] Copy Variant IDs → .env LEMONSQUEEZY_VARIANT_ID_BASIC / _FULL
- [ ] Copy Store ID → .env LEMONSQUEEZY_STORE_ID
- [ ] Create API key → .env LEMONSQUEEZY_API_KEY
- [ ] Add webhook (order_created) → copy signing secret → .env LEMONSQUEEZY_WEBHOOK_SECRET
- [ ] Test with ngrok: ngrok http 3000
- [ ] Full end-to-end test with test purchase
- [ ] Verify idempotency: trigger webhook twice for same job, confirm second run skipped

### Day 4 — Database & full local test
- [x] Set up PostgreSQL (Neon free tier — DATABASE_URL already in .env)
- [x] Add DATABASE_URL to .env
- [x] npx prisma generate && npx prisma db push
- [x] npm run dev (backend) + cd client && npm run dev (frontend)
- [x] Upload a real resume PDF end-to-end with SKIP_PAYMENT=true
- [x] Confirm processing page polls correctly and shows COMPLETE state
- [x] Verified idempotency — second analyseJob() call on COMPLETE job skips correctly
- [x] R2 upload confirmed — signed URL stored in DB, 72h expiry
- [x] Email sent via Resend on job completion

### Day 5 — Rename + polish ✅
- [x] Rename product from "ResumeAI" to "Shortlisted" across all frontend + backend files
- [x] Update pricing: Basic $9 → $12, Full $19 → $29
- [x] Upgrade email templates — new branding, better copy, card layout
- [x] Update PDF report header to show "The Audit" / "The Glow-Up" tier labels
- [x] Add referral copy-link prompt to SuccessView
- [x] Update hero copy on UploadView
- [ ] Verify getshortlisted.fyi domain in Resend dashboard (manual — user action)
- [ ] Update Lemon Squeezy product prices to $12 / $29 (manual — user action)

### Day 6 — Deploy to Railway
- [ ] Push to GitHub
- [ ] Connect repo in Railway dashboard
- [ ] Add all production env vars (MOCK_CLAUDE=false, SKIP_PAYMENT=false)
- [ ] Confirm /api/health returns { status: 'ok', db: 'connected' }
- [ ] Run live end-to-end test with real purchase

---

## PRD Notes (from Market Analysis)

### Pricing (update before launch)
- [ ] Raise Basic from $9 → $12
- [ ] Raise Full from $19 → $29
- [ ] Update Lemon Squeezy product prices
- [ ] Update tier labels and prices in UploadView.jsx

### Backlog (v1.1)
- [ ] LinkedIn About section rewrite in Full tier (add to Claude rewrite prompt)
- [ ] 3-pack bundle: 3 analyses for $25
- [ ] 30-day follow-up re-engagement email
- [ ] Referral discount code on success page
- [ ] Job description URL input (Jina AI reader API: r.jina.ai/{url})

### Critical constraints — never violate
- Webhook handler responds 200 in < 5s — analyseJob() is always fire-and-forget
- analyseJob() checks job status before running — idempotency guard in place
- MOCK_CLAUDE and SKIP_PAYMENT must be false in production (enforced at startup)
- Input truncation: resume ≤ 6,000 chars, JD ≤ 4,000 chars — prevents Claude cost spikes
