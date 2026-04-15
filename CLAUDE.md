# Shortlisted — CLAUDE.md

## What this is
A pay-per-use web app that analyses a resume against a job description using Claude,
scores ATS compatibility, identifies keyword gaps, and optionally rewrites weak bullets.
Two tiers: The Audit ($12) and The Glow-Up ($29). No accounts. Email delivery of PDF report.

## Stack
- **Backend:** Node.js + Express, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **AI:** Anthropic Claude API (claude-sonnet-4-6) — two-call prompt chain
- **Payments:** Lemon Squeezy (one-time, no subscriptions in v1)
- **PDF parsing:** pdf-parse
- **PDF generation:** Puppeteer → HTML template → PDF
- **File storage:** Cloudflare R2 (S3-compatible)
- **Email:** Resend
- **Deploy:** Railway

## Project structure
```
resumeai/
  src/
    routes/         # Express route handlers
    services/       # Business logic (claude, payments, pdf, email, storage)
    lib/            # DB client, config, logger
    middleware/      # Error handler, raw body parser for Lemon Squeezy
  prisma/
    schema.prisma
  .claude/
    todo.md         # Current task state
    lessons.md      # Failure log
  CLAUDE.md         # This file
```

## Key constraints
- Lemon Squeezy webhook handler must respond 200 in < 5s. Fire analysis in background, never await it in the handler.
- pdf-parse returns empty string on scanned/image PDFs. Detect: if extracted text < 200 chars, reject with clear user error.
- Claude must return strict JSON. Always validate with JSON.parse(). Retry once on failure before marking job failed.
- Puppeteer needs bundled Chromium on Railway. Use `puppeteer` (not `puppeteer-core`). Set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false.
- R2 signed URLs expire in 72 hours. Set on job completion, store in DB.
- Make analyseJob idempotent — check job status before re-running (Lemon Squeezy retries webhooks).

## Job status flow
pending_payment → processing → complete | failed

## Environment variables required
DATABASE_URL, ANTHROPIC_API_KEY, LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_WEBHOOK_SECRET,
LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_VARIANT_ID_BASIC, LEMONSQUEEZY_VARIANT_ID_FULL,
RESEND_API_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, APP_URL

## Prompt chain
- Call 1 (both tiers): analysis JSON — ats_score, keyword_gaps, keyword_matches, weaknesses, strengths, linkedin_headline
- Call 2 (full tier only): rewrite JSON — rewritten_bullets (top 5), summary_rewrite, skills_section

## Pricing logic
- The Audit $12: Call 1 only → PDF with analysis
- The Glow-Up $29: Call 1 + Call 2 → PDF with analysis + rewrites
- Credit bundle $49/2000 URLs — add in v2 only

## Writing style
- Never use em dashes (—) in UI copy, error messages, placeholders, or AI-generated content (PDF reports, cover letters, bullet rewrites). Use a period, comma, or reword instead.

## What not to build in v1
- User accounts / auth
- Subscription billing
- OCR for scanned PDFs
- Credit system
- Admin dashboard