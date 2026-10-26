import { Stack } from 'expo-router';

import { colors } from '@/ui/theme';

export default function AuthLayout() {
  // `login` is declared first so it is the screen users land on when the
  // root guard redirects them here (signed out / session expired).
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
