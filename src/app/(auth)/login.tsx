import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { toUserMessage } from '@/api/api-error-message';
import { useAuth } from '@/features/auth/auth-context';
import { validateEmail, validatePassword } from '@/features/auth/auth-validation';
import { AuthScreenLayout } from '@/features/auth/components/auth-screen-layout';
import { FormErrorBanner } from '@/features/auth/components/form-error-banner';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';
import { isEmailNotVerifiedError } from '@/features/auth/parse-auth-session-response';
import { Button } from '@/ui/button';
import { TextField, type TextInputHandle } from '@/ui/text-field';
import { colors, fontSize } from '@/ui/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const passwordRef = useRef<TextInputHandle>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string | null;
    password?: string | null;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setFormError(null);
    setSubmitting(true);
    try {
      // On success the root layout's guard swaps to the app stack.
      await login(email, password);
    } catch (error) {
      if (isEmailNotVerifiedError(error)) {
        setFormError(
          'Email chưa được xác thực. Mở email xác thực chúng tôi đã gửi rồi đăng nhập lại.',
        );
        setSubmitting(false);
        return;
      }
      setFormError(
        toUserMessage(error, {
          401: 'Email hoặc mật khẩu không đúng.',
          403: 'Tài khoản đã bị vô hiệu hoá. Liên hệ hỗ trợ.',
        }),
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Đăng nhập"
      subtitle="Tiếp tục hành trình học backend bằng dự án thật."
      footer={
        <>
          <Link href="/forgot-password" style={styles.link}>
            Quên mật khẩu?
          </Link>
          <Text style={styles.muted}>
            Chưa có tài khoản?{' '}
            <Link href="/register" style={styles.link}>
              Đăng ký
            </Link>
          </Text>
        </>
      }
    >
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={fieldErrors.email}
        placeholder="ban@vidu.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <FormErrorBanner message={formError} />
      <Button label="Đăng nhập" loading={submitting} onPress={handleSubmit} />
      <GoogleSignInButton disabled={submitting} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accentStrong, fontSize: fontSize.sm, fontWeight: '600' },
  muted: { color: colors.fgMuted, fontSize: fontSize.sm },
});
