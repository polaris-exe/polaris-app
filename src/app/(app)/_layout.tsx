import { Stack } from 'expo-router';

import { colors } from '@/ui/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.fg,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="discussion/[id]" options={{ title: 'Thảo luận' }} />
      <Stack.Screen
        name="discussion/new"
        options={{ title: 'Đặt câu hỏi', presentation: 'modal' }}
      />
    </Stack>
  );
}
