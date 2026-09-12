import { Platform } from 'react-native';

import { colors } from '../theme/tokens';

const STYLE_ID = 'app-web-scroll-theme';

// Native scroll indicators float over the content and fade in only while
// scrolling. The web build's plain overflow:auto div doesn't do that on its
// own — toggling the scrollbar's WIDTH (0 -> thin) was the first attempt,
// but that reserves/frees layout space each time, so the content visibly
// resized as it appeared. Fixed here by keeping the scrollbar's own width
// constant (and, in Chromium, truly overlaid via `overflow: overlay` so it
// never reserves space at all) and fading only the thumb's color/opacity.
export function applyWebScrollTheme(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .web-fade-scrollbar {
      overflow-y: auto;
      overflow-y: overlay;
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }
    .web-fade-scrollbar.is-scrolling {
      scrollbar-color: ${colors.lineNormalNormal} transparent;
    }
    .web-fade-scrollbar::-webkit-scrollbar {
      width: 3px;
    }
    .web-fade-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .web-fade-scrollbar::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 2px;
      transition: background 0.2s ease;
    }
    .web-fade-scrollbar.is-scrolling::-webkit-scrollbar-thumb {
      background: ${colors.lineNormalNormal};
    }
  `;
  document.head.appendChild(style);
}

// Attach to a ScrollView's ref (native-stack's `.current` on web resolves to
// the RN Web ScrollView, which exposes the raw scrollable DOM node). No-op
// on native. Returns a cleanup function.
export function fadeScrollbarOnScroll(node: unknown): () => void {
  if (Platform.OS !== 'web') return () => {};
  const el = (node as { getScrollableNode?: () => HTMLElement | null } | null)?.getScrollableNode?.();
  if (!el) return () => {};

  applyWebScrollTheme();
  el.classList.add('web-fade-scrollbar');

  let timer: ReturnType<typeof setTimeout>;
  const onScroll = () => {
    el.classList.add('is-scrolling');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('is-scrolling'), 700);
  };
  el.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    el.removeEventListener('scroll', onScroll);
    clearTimeout(timer);
  };
}
