import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { applyWebInputTheme } from './src/utils/webInputTheme';

// Web-only preview chrome: constrains the app to a phone-sized viewport
// (matches the 390x844 reference used in the design handoff) instead of
// stretching full-bleed across the browser window. Native builds render
// RootNavigator directly and never see this wrapper.
export default function App() {
  if (Platform.OS === 'web') {
    applyWebInputTheme();
    return (
      <View style={styles.webBackdrop}>
        <View style={styles.webPhoneFrame}>
          <RootNavigator />
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  webPhoneFrame: {
    width: 390,
    height: 844,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 24px 60px rgba(16,18,22,.18), 0 0 0 10px #15171c',
  },
});
