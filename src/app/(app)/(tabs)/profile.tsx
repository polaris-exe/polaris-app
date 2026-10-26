import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { Button } from '@/ui/button';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

const PLAN_LABELS = { free: 'Free', pro: 'Pro', pro_max: 'Pro Max' } as const;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    setLoggingOut(true);
    // The root guard swaps to the auth stack once the user is cleared.
    await logout();
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.display_name.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user.display_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.plan}>Gói {PLAN_LABELS[user.plan]}</Text>
        </View>
      </View>

      <Button
        label="Đăng xuất"
        variant="secondary"
        loading={loggingOut}
        onPress={handleLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: spacing.lg, gap: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.accentStrong, fontSize: fontSize.xl, fontWeight: '700' },
  info: { flex: 1, gap: 2 },
  name: { color: colors.fg, fontSize: fontSize.lg, fontWeight: '700' },
  email: { color: colors.fgMuted, fontSize: fontSize.sm },
  plan: { color: colors.accentStrong, fontSize: fontSize.xs, fontWeight: '600', marginTop: spacing.xs },
});
