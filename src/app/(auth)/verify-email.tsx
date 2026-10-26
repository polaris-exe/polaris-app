import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreenLayout } from '@/features/auth/components/auth-screen-layout';
import { Button } from '@/ui/button';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

/**
 * Shown after registering when the backend requires email verification
 * (`verification_required: true`). The account exists but cannot log in
 * until the link in the email is opened.
 */
export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthScreenLayout
      title="Xác thực email"
      subtitle="Còn một bước nữa để kích hoạt tài khoản."
    >
      <View style={styles.notice} accessibilityRole="alert">
        <Ionicons name="mail-unread-outline" size={28} color={colors.accentStrong} />
        <Text style={styles.text}>
          Chúng tôi đã gửi email xác thực tới{' '}
          <Text style={styles.email}>{email ?? 'email của bạn'}</Text>. Mở email
          và làm theo hướng dẫn, sau đó quay lại app để đăng nhập.
        </Text>
        <Text style={styles.hint}>
          Không thấy email? Kiểm tra thư mục Spam / Quảng cáo.
        </Text>
      </View>
      <Button label="Đến trang đăng nhập" onPress={() => router.replace('/login')} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  text: { color: colors.fg, fontSize: fontSize.md, lineHeight: 22 },
  email: { color: colors.accentStrong, fontWeight: '600' },
  hint: { color: colors.fgMuted, fontSize: fontSize.sm },
});
