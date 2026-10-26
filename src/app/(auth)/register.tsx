import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { toUserMessage } from '@/api/api-error-message';
import { openLegalPage } from '@/config/legal-urls';
import { useAuth } from '@/features/auth/auth-context';
import {
  PASSWORD_MIN_LENGTH,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/features/auth/auth-validation';
import { AuthScreenLayout } from '@/features/auth/components/auth-screen-layout';
import { FormErrorBanner } from '@/features/auth/components/form-error-banner';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';
import { Button } from '@/ui/button';
import { TextField, type TextInputHandle } from '@/ui/text-field';
import { colors, fontSize } from '@/ui/theme';

interface RegisterFieldErrors {
  displayName?: string | null;
  email?: string | null;
  password?: string | null;
  confirmation?: string | null;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const emailRef = useRef<TextInputHandle>(null);
  const passwordRef = useRef<TextInputHandle>(null);
  const confirmationRef = useRef<TextInputHandle>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const errors: RegisterFieldErrors = {
      displayName: validateDisplayName(displayName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmation: validatePasswordConfirmation(password, confirmation),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setFormError(null);
    setSubmitting(true);
    try {
      // With a session the root guard swaps to the app; otherwise the
      // account must confirm its email before it can log in.
      const outcome = await register(email, displayName, password);
      if (outcome === 'verification_required') {
        router.replace({
          pathname: '/verify-email',
          params: { email: email.trim() },
        });
      }
    } catch (error) {
      setFormError(
        toUserMessage(error, {
          409: 'Email này đã được đăng ký. Hãy đăng nhập.',
        }),
      );
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Tạo tài khoản"
      subtitle="Học lập trình bằng cách xây dựng dự án thật, có chấm code tự động."
      footer={
        <Text style={styles.muted}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={styles.link}>
            Đăng nhập
          </Link>
        </Text>
      }
    >
      <TextField
        label="Tên hiển thị"
        value={displayName}
        onChangeText={setDisplayName}
        error={fieldErrors.displayName}
        placeholder="Nguyễn Văn A"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
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
        hint={`Ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmationRef.current?.focus()}
      />
      <TextField
        ref={confirmationRef}
        label="Nhập lại mật khẩu"
        value={confirmation}
        onChangeText={setConfirmation}
        error={fieldErrors.confirmation}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <FormErrorBanner message={formError} />
      <Text style={styles.muted}>
        Bằng việc đăng ký, bạn đồng ý với{' '}
        <Text
          accessibilityRole="link"
          style={styles.link}
          onPress={() => openLegalPage('terms')}
        >
          Điều khoản sử dụng
        </Text>{' '}
        và{' '}
        <Text
          accessibilityRole="link"
          style={styles.link}
          onPress={() => openLegalPage('privacy')}
        >
          Chính sách quyền riêng tư
        </Text>{' '}
        của Polaris.
      </Text>
      <Button label="Đăng ký" loading={submitting} onPress={handleSubmit} />
      <GoogleSignInButton disabled={submitting} />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accentStrong, fontSize: fontSize.sm, fontWeight: '600' },
  muted: { color: colors.fgMuted, fontSize: fontSize.sm },
});
