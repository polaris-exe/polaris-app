import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from './button';
import { colors, fontSize, spacing } from './theme';

export function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

interface MessageStateProps {
  readonly title: string;
  readonly message?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
}

export function MessageState({
  title,
  message,
  actionLabel,
  onAction,
}: MessageStateProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.fg,
    fontSize: fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: { color: colors.fgMuted, fontSize: fontSize.sm, textAlign: 'center' },
});
