import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { openLegalPage } from '@/config/legal-urls';
import { useAuth } from '@/features/auth/auth-context';
import { useHiddenContent } from '@/features/community/hidden-content-context';
import { Button } from '@/ui/button';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

const PLAN_LABELS = { free: 'Free', pro: 'Pro', pro_max: 'Pro Max' } as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { blockedAuthors, unblockAuthor } = useHiddenContent();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    setLoggingOut(true);
    // The root guard swaps to the auth stack once the user is cleared.
    await logout();
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
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

      {blockedAuthors.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Người dùng đã chặn</Text>
          {blockedAuthors.map((author) => (
            <View key={author.user_id} style={styles.blockedRow}>
              <Text style={styles.blockedName} numberOfLines={1}>
                {author.display_name || 'Người dùng'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Bỏ chặn ${author.display_name}`}
                hitSlop={8}
                onPress={() => unblockAuthor(author.user_id)}
              >
                <Text style={styles.unblock}>Bỏ chặn</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin</Text>
        <LinkRow
          label="Chính sách quyền riêng tư"
          onPress={() => openLegalPage('privacy')}
        />
        <LinkRow
          label="Điều khoản sử dụng"
          onPress={() => openLegalPage('terms')}
        />
      </View>

      <Button
        label="Đăng xuất"
        variant="secondary"
        loading={loggingOut}
        onPress={handleLogout}
      />
      <Button
        label="Xoá tài khoản"
        variant="danger"
        disabled={loggingOut}
        onPress={() => router.push('/delete-account')}
      />
    </ScrollView>
  );
}

function LinkRow({
  label,
  onPress,
}: {
  readonly label: string;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
    >
      <Text style={styles.linkLabel}>{label}</Text>
      <Ionicons name="open-outline" size={16} color={colors.fgSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, gap: spacing.xl },
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
  section: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  sectionTitle: { color: colors.fgMuted, fontSize: fontSize.sm, fontWeight: '600' },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  blockedName: { color: colors.fg, fontSize: fontSize.md, flexShrink: 1 },
  unblock: { color: colors.accentStrong, fontSize: fontSize.sm, fontWeight: '600' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  linkLabel: { color: colors.fg, fontSize: fontSize.md },
  pressed: { opacity: 0.6 },
});
