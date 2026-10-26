import { Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { HiddenContentProvider } from '@/features/community/hidden-content-context';
import { colors } from '@/ui/theme';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <HiddenContentProvider userId={user?.id ?? null}>
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
        <Stack.Screen
          name="delete-account"
          options={{ title: 'Xoá tài khoản', presentation: 'modal' }}
        />
      </Stack>
    </HiddenContentProvider>
  );
}
