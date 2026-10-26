import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { toUserMessage } from '@/api/api-error-message';
import { apiForgotPassword } from '@/features/auth/auth-api';
import { validateEmail } from '@/features/auth/auth-validation';
import { AuthScreenLayout } from '@/features/auth/components/auth-screen-layout';
import { FormErrorBanner } from '@/features/auth/components/form-error-banner';
import { Button } from '@/ui/button';
import { TextField } from '@/ui/text-field';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await apiForgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setFormError(toUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu."
      footer={
        <Link href="/login" style={styles.link}>
          Quay lại đăng nhập
        </Link>
      }
    >
      {sent ? (
        <View style={styles.success} accessibilityRole="alert">
          <Text style={styles.successText}>
            Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được
            gửi. Mở email và làm theo hướng dẫn, sau đó đăng nhập lại trên app.
          </Text>
        </View>
      ) : (
        <>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder="ban@vidu.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          <FormErrorBanner message={formError} />
          <Button
            label="Gửi liên kết"
            loading={submitting}
            onPress={handleSubmit}
          />
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accentStrong, fontSize: fontSize.sm, fontWeight: '600' },
  success: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
    padding: spacing.md,
  },
  successText: { color: colors.fg, fontSize: fontSize.sm, lineHeight: 20 },
});
