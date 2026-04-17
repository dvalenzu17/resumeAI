// Thin wrapper around gtag so views don't depend on window.gtag directly.
// All calls are no-ops if gtag hasn't loaded (e.g. ad blockers, dev).

function gtag(...args) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

// Called when the user submits the resume form
export function trackResumeSubmitted({ tier }) {
  gtag('event', 'resume_submitted', { tier });
}

// Called when the preview page loads with real data
export function trackPreviewViewed({ shortlist_match_rate, tier }) {
  gtag('event', 'preview_viewed', { shortlist_match_rate, tier });
}

// Called when the user switches tier on the preview page
export function trackTierSelected({ tier }) {
  gtag('event', 'tier_selected', { tier });
}

// Called when the user clicks Unlock / Continue to checkout
export function trackCheckoutStarted({ tier, price }) {
  gtag('event', 'checkout_started', {
    tier,
    value: price,
    currency: 'USD',
  });
}

// Called when the success page loads (payment confirmed)
export function trackPurchaseComplete({ tier, price }) {
  gtag('event', 'purchase', {
    transaction_id: Date.now().toString(),
    value: price,
    currency: 'USD',
    items: [{ item_name: tier === 'FULL' ? 'The Glow-Up' : 'The Audit' }],
  });
}
