# Lessons / Failure Log

## pdf-parse import
Use `pdf-parse/lib/pdf-parse.js` as the import path (not the package root) when using ESM,
because the package root does an eager `require()` of test fixtures that breaks under ESM.

## Stripe webhook raw body
Express must NOT parse the body as JSON before the Stripe webhook route.
The rawBody middleware captures the raw UTF-8 string needed for signature verification.
Mount `/api/webhooks` with rawBody BEFORE the global `express.json()` call.

## analyseJob idempotency
Stripe retries failed webhooks. Always check job.status at the start of analyseJob() and
return early if status is PROCESSING or COMPLETE. Prevents duplicate Claude calls and emails.

## Puppeteer on Railway
Use the full `puppeteer` package (not `puppeteer-core`) so Chromium is bundled.
Always pass args: ['--no-sandbox', '--disable-setuid-sandbox'] — Railway containers
do not support sandboxing.

## Claude JSON reliability
Claude occasionally wraps output in markdown code fences despite explicit instructions.
Strip ```json ... ``` fences before JSON.parse(). Always retry once with a stricter prompt
suffix before failing the job.
