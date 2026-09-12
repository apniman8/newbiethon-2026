import { useEffect, useState } from 'react';

// docs/PRD.md "요청이 8초 이상 걸림": a spinner alone doesn't tell the user
// whether the app is stuck. Flips to true after `delayMs` while `active`.
export function useSlowLoadHint(active: boolean, delayMs = 8000): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return slow;
}
