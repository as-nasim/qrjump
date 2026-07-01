// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import ScannerScreen from './src/screens/ScannerScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';

export type RootStackParamList = {
  Scanner: undefined;
  Result: { result: any; onRescan: () => void };
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Scanner"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: '#0A0A0F' },
          }}
        >
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
