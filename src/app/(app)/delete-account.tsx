import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { toUserMessage } from '@/api/api-error-message';
import { useAuth } from '@/features/auth/auth-context';
import { validatePassword } from '@/features/auth/auth-validation';
import { FormErrorBanner } from '@/features/auth/components/form-error-banner';
import { Button } from '@/ui/button';
import { TextField } from '@/ui/text-field';
import { colors, fontSize, spacing } from '@/ui/theme';

export default function DeleteAccountScreen() {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    const error = validatePassword(password);
    setPasswordError(error);
    setFormError(null);
    if (error) return;

    Alert.alert(
      'Xoá tài khoản vĩnh viễn?',
      'Bạn sẽ bị đăng xuất trên mọi thiết bị và không thể khôi phục tài khoản này.',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Xoá tài khoản', style: 'destructive', onPress: () => void submit() },
      ],
    );
  }

  async function submit() {
    setSubmitting(true);
    try {
      // On success the root guard swaps to the auth stack and unmounts this.
      await deleteAccount(password);
    } catch (err) {
      setFormError(
        toUserMessage(err, {
          401: 'Mật khẩu không đúng.',
          // Password length is checked above, so a 400 means a social
          // account that never set a password.
          400: 'Tài khoản này đăng nhập bằng Google nên chưa có mật khẩu. Hãy đăng xuất, dùng "Quên mật khẩu" để đặt mật khẩu rồi thử lại.',
        }),
      );
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.warning}>
          Tài khoản sẽ bị xoá và bạn bị đăng xuất trên mọi thiết bị. Bạn sẽ
          không thể đăng nhập lại hay khôi phục tài khoản này.
        </Text>
        <TextField
          label="Nhập mật khẩu để xác nhận"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <FormErrorBanner message={formError} />
        <Button
          label="Xoá tài khoản"
          variant="danger"
          loading={submitting}
          onPress={handleSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  warning: { color: colors.fgMuted, fontSize: fontSize.sm, lineHeight: 20 },
});
