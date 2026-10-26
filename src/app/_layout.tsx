import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { queryClient } from '@/config/query-client';
import { UpdateReadyBanner } from '@/features/app-updates/update-ready-banner';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { colors } from '@/ui/theme';

// Keep the splash up until the stored session has been checked, so users
// never see the login screen flash before landing in the app.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
        {/* Rendered after the navigator so it floats above every screen. */}
        <UpdateReadyBanner />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { user, isRestoring } = useAuth();

  useEffect(() => {
    if (!isRestoring) {
      void SplashScreen.hideAsync();
    }
  }, [isRestoring]);

  const isLoggedIn = user !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* "/" redirects by auth state; unguarded so launch always matches. */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
