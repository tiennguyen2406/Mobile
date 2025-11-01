import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Thêm Khoản Mới' }} />
        <Stack.Screen name="edit/[id]" options={{ title: 'Chỉnh Sửa Khoản Chi' }} />
      </Stack>
    </SafeAreaProvider>
  );
}