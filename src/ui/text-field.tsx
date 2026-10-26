import type { ComponentRef, Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, fontSize, radius, spacing } from './theme';

/** Instance type of TextInput (for `useRef`), e.g. to call `.focus()`. */
export type TextInputHandle = ComponentRef<typeof TextInput>;

interface TextFieldProps extends TextInputProps {
  readonly label: string;
  readonly error?: string | null;
  readonly hint?: string;
  readonly ref?: Ref<TextInputHandle>;
}

// React 19: `ref` is a regular prop, no forwardRef needed.
export function TextField({ label, error, hint, style, ref, ...rest }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.fgSubtle}
        selectionColor={colors.accent}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { color: colors.fgMuted, fontSize: fontSize.sm, fontWeight: '500' },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.fg,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: fontSize.xs },
  hint: { color: colors.fgSubtle, fontSize: fontSize.xs },
});
