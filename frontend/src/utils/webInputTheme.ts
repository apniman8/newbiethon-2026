import { Platform } from 'react-native';

import { colors } from '../theme/tokens';

const STYLE_ID = 'app-web-input-theme';

// react-native-web renders TextInput as a plain <input>, so the browser's
// own default focus ring (an orange/yellow glow in most mobile browsers)
// shows through on tap instead of our themed border. Native builds never
// run this — RN's own TextInput has no such default chrome there.
export function applyWebInputTheme(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    input, textarea {
      outline: none;
      -webkit-tap-highlight-color: transparent;
      caret-color: ${colors.primary};
    }
    input::selection, textarea::selection {
      background: ${colors.calloutBackground};
    }
  `;
  document.head.appendChild(style);
}
