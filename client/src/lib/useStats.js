import { useState, useEffect } from 'react';

export function useStats() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => { if (typeof d.total === 'number') setTotal(d.total); })
      .catch(() => {}); // silently fail — UI falls back gracefully
  }, []);

  return total;
}
