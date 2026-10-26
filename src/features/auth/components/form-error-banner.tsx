import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/ui/theme';

/** Server-side error shown above a form's submit button. */
export function FormErrorBanner({ message }: { readonly message: string | null }) {
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
  },
  text: { color: colors.danger, fontSize: fontSize.sm },
});
