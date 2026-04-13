// Capture raw body for Stripe webhook signature verification.
// Must be registered before express.json() for the webhook route.
export function rawBody(req, res, next) {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    data += chunk;
  });
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
}
