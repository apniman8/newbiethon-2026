import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ArrivedScreen } from '../screens/ArrivedScreen';
import { DestinationInputScreen } from '../screens/DestinationInputScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { OriginInputScreen } from '../screens/OriginInputScreen';
import { GuideScreen } from '../screens/GuideScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Flow: origin place selection -> destination place selection ->
// loading (fetches the live route) -> guide checklist -> arrived.
// docs/PRD.md "핵심 기능" / docs/ARCHITECTURE.md 디렉토리 구조.
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OriginInput" component={OriginInputScreen} />
        <Stack.Screen name="DestinationInput" component={DestinationInputScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Guide" component={GuideScreen} />
        <Stack.Screen name="Arrived" component={ArrivedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
