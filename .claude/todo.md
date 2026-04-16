# Shortlisted — Task State

## Status: All pre-launch code complete — blocked on domain purchase + Railway deploy

---

## Blocked — manual actions required

### Railway deploy
- [ ] Set MOCK_CLAUDE=false, SKIP_PAYMENT=false
- [ ] Run live end-to-end test with real Lemon Squeezy test purchase

### After domain is live
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

---

## Roadmap

### V2 — Repeat purchase engine (months 2–3)
- [ ] Add user accounts (use Clerk for auth — drop-in, no custom auth code)
- [ ] Job tracker dashboard — user saves applied jobs, sees history
- [ ] Re-run analysis on saved resume vs new JD at discounted repeat price ($7)
- [ ] Store best-performing resume version per user in DB
- [ ] Trigger email 3 days after purchase: "you applied — here's how to follow up"
- [ ] Add createdAt-based cron job to send follow-up emails via Resend

### V3 — LinkedIn profile analyser (months 3–4)
- [ ] Scrape LinkedIn profile via Playwright given a URL input
- [ ] Evaluate: use Proxycurl API instead of raw scraper (cheaper than maintenance cost of fighting LinkedIn bot detection, ~$0.01/profile)
- [ ] Run same Claude analysis chain against LinkedIn sections vs target role
- [ ] New report sections: headline score, about section rewrite, experience section gaps
- [ ] Pricing: $15 audit / $35 full rewrite with suggested text per section
- [ ] Add LinkedIn URL input field to upload form as optional second product entry point

### V4 — Subscription tier (months 4–6)
- [ ] Shortlisted Pro at $19/month via Lemon Squeezy subscription product
- [ ] Unlimited CV analyses + unlimited LinkedIn scans for subscribers
- [ ] Weekly job match email: cron job that scrapes/fetches 10 matching jobs and scores resume fit against each automatically
- [ ] Evaluate job data sources: LinkedIn Jobs API, Indeed (check ToS), Coresignal, RapidAPI job search — do NOT roll a raw scraper against Indeed (legal risk)
- [ ] Basic pro dashboard: usage history, saved resume versions, match scores over time
- [ ] Target 3–5% conversion from free users to Pro

### V5 — B2B university and bootcamp licences (months 6–12)
- [ ] Build white-label skin system — career centre can add their logo and colours
- [ ] Admin dashboard: aggregate student usage stats, average ATS score improvement, top keyword gaps by cohort
- [ ] Pricing model: $3–5/student/month or flat annual licence $5k–$15k depending on cohort size
- [ ] Sales target: one signed university contract by month 10
- [ ] Identify targets: university career centres in Panama + Latin America first, then US bootcamps (App Academy, Flatiron, etc.)
- [ ] Collateral needed before outreach: usage stats dashboard, one-pager PDF, case study from a real user showing score improvement and callback result
- [ ] Sales cycle expectation: 2–4 months from first contact to signed contract — start outreach at month 6

### V6 — Job market intelligence data product (year 2)
- [ ] Prerequisite: 50,000+ resume/JD analysis data points before this is meaningful
- [ ] Build anonymised aggregate reporting: which keywords correlate with callbacks by role and region
- [ ] Package as monthly "Job Market Intelligence" report for recruiters and HR teams
- [ ] Pricing: $299–$999/month per company
- [ ] Privacy requirements before launch: explicit user consent in ToS for anonymised data use, proper anonymisation pipeline, legal review — do NOT skip this
- [ ] Target buyers: in-house recruiters, HR tech companies, staffing agencies

### Distribution milestones (cross-version)
- [ ] $500 MRR — target within 60 days of payment processor going live (~18 Glow-Up sales/month)
- [ ] 100 total analyses run — unlock social proof, update homepage counter
- [ ] First r/cscareerquestions post with organic traction — screenshot and add to homepage
- [ ] First testimonial with a specific outcome ("got a callback after fixing the gaps") — add to homepage immediately
- [ ] 1,000 monthly active free users — triggers V4 subscription build
- [ ] First B2B conversation booked — triggers V5 collateral build
