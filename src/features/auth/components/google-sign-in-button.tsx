import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ApiClientError } from '@/api/api-client';
import { toUserMessage } from '@/api/api-error-message';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

import { useAuth } from '../auth-context';
import { FormErrorBanner } from './form-error-banner';

interface GoogleSignInButtonProps {
  /** Disables the button while the email form is submitting. */
  readonly disabled?: boolean;
}

/**
 * "Tiếp tục với Google" + divider. Works for both login and register: the
 * backend creates the account on first Google sign-in.
 *
 * Hidden on iOS: the App Store requires Sign in with Apple next to any
 * third-party login, which the backend does not support yet, so iOS offers
 * email/password only.
 */
export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  if (Platform.OS === 'ios') return null;
  return <GoogleSignInSection {...props} />;
}

function GoogleSignInSection({ disabled = false }: GoogleSignInButtonProps) {
  const { signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setError(null);
    setLoading(true);
    try {
      // On success the root guard swaps to the app stack and unmounts this.
      const outcome = await signInWithOAuth('google');
      if (outcome === 'cancelled') setLoading(false);
    } catch (err) {
      // The backend folds every OAuth failure (incl. disabled accounts) into
      // a single `oauth_failed` redirect, so there is no finer reason to show.
      setError(
        err instanceof ApiClientError && err.code === 'oauth_failed'
          ? 'Đăng nhập Google thất bại. Vui lòng thử lại.'
          : toUserMessage(err),
      );
      setLoading(false);
    }
  }

  const isDisabled = disabled || loading;

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>hoặc</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tiếp tục với Google"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.fg} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color={colors.fg} />
            <Text style={styles.label}>Tiếp tục với Google</Text>
          </>
        )}
      </Pressable>

      <FormErrorBanner message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: { color: colors.fgSubtle, fontSize: fontSize.sm },
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { color: colors.fg, fontSize: fontSize.md, fontWeight: '600' },
});
