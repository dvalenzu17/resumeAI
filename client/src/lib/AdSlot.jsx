import { useEffect } from 'react';

// AdSense publisher ID — set once here, used by every ad slot across the blog.
// Ad slot IDs (data-ad-slot) must be replaced with real slot IDs from your AdSense dashboard
// once ad units are created under your account.
const PUBLISHER_ID = 'ca-pub-2278670005395908';

const SLOT_IDS = {
  'top-banner': '1111111111', // Banner after article intro — replace with real slot ID
  'mid-banner': '2222222222', // Banner before article CTA — replace with real slot ID
};

export default function AdSlot({ slot }) {
  const slotId = SLOT_IDS[slot] || SLOT_IDS['top-banner'];

  useEffect(() => {
    // Push the ad unit into the AdSense queue on mount.
    // Required in SPAs because the adsbygoogle script only auto-processes elements
    // that exist at initial page load.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {
      // AdSense not loaded yet (dev, ad blocker, etc.) — fail silently
    }
  }, []);

  return (
    <div
      aria-label="Advertisement"
      style={{ display: 'block', minHeight: '90px', margin: '32px 0', textAlign: 'center' }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
