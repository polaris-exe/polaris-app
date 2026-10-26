import Ionicons from '@expo/vector-icons/Ionicons';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, radius, spacing } from '@/ui/theme';

import { useForegroundUpdateCheck } from './use-foreground-update-check';

/**
 * Floating banner shown once an OTA update has been downloaded. Users can
 * restart now or dismiss it; a dismissed update still applies on the next
 * cold start, so nobody is forced to reload mid-task.
 */
export function UpdateReadyBanner() {
  useForegroundUpdateCheck();
  const { isUpdatePending } = Updates.useUpdates();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);
  const [restarting, setRestarting] = useState(false);

  if (!isUpdatePending || dismissed) return null;

  async function restart() {
    setRestarting(true);
    try {
      await Updates.reloadAsync();
    } catch {
      // Reload unavailable — the update still applies on next launch.
      setRestarting(false);
      setDismissed(true);
    }
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + spacing.sm }]}
    >
      <View style={styles.banner} accessibilityRole="alert">
        <Ionicons name="cloud-download-outline" size={20} color={colors.accentStrong} />
        <Text style={styles.text}>Đã có bản cập nhật mới.</Text>
        <Pressable
          accessibilityRole="button"
          disabled={restarting}
          onPress={restart}
          hitSlop={8}
        >
          <Text style={styles.action}>
            {restarting ? 'Đang khởi động…' : 'Cập nhật'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Để sau"
          onPress={() => setDismissed(true)}
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={colors.fgMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface2,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  text: { flex: 1, color: colors.fg, fontSize: fontSize.sm },
  action: { color: colors.accentStrong, fontSize: fontSize.sm, fontWeight: '700' },
});
