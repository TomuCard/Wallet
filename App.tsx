import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddSubscriptionScreen } from './src/screens/AddSubscriptionScreen';
import { ApiKeyModal } from './src/components/ApiKeyModal';
import { getBrandfetchKey } from './src/utils/settings';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showApiModal, setShowApiModal] = useState(false);

  useEffect(() => {
    getBrandfetchKey().then((key) => {
      if (!key) setShowApiModal(true);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0B0B12' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="AddSubscription"
            component={AddSubscriptionScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <ApiKeyModal
        visible={showApiModal}
        onSaved={() => setShowApiModal(false)}
      />
    </SafeAreaProvider>
  );
}
