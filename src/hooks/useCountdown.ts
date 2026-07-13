import { useEffect, useState } from 'react';

function computeRemaining(startedAtMs: number | null, durationSeconds: number): number {
  if (startedAtMs === null) return durationSeconds;
  const elapsed = Math.floor((Date.now() - startedAtMs) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}

// Koha e mbetur llogaritet gjithmonë nga momenti origjinal i fillimit,
// kështu që rifreskimi i faqes nuk e ndalon dhe nuk e rikthen kohëmatësin.
export function useCountdown(startedAtMs: number | null, durationSeconds: number): number {
  const [remaining, setRemaining] = useState(() => computeRemaining(startedAtMs, durationSeconds));

  useEffect(() => {
    setRemaining(computeRemaining(startedAtMs, durationSeconds));
    if (startedAtMs === null) return;

    const id = setInterval(() => {
      const next = computeRemaining(startedAtMs, durationSeconds);
      setRemaining(next);
      if (next <= 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [startedAtMs, durationSeconds]);

  return remaining;
}
