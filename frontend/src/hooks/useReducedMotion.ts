import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// docs/UI_GUIDE.md "모션 감소": dash flow, pulse and camera-pan transitions
// must stop when the OS-level reduce-motion setting is on.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
