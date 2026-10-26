// Client-side checks mirror the backend DTOs (polaris-be auth.dto.ts) so the
// user sees the problem before a round trip. The backend stays authoritative.

export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 254;
const DISPLAY_NAME_MAX_LENGTH = 80;

// Pragmatic shape check; the backend runs the strict IsEmail validator.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Vui lòng nhập email.';
  if (value.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(value)) {
    return 'Email không hợp lệ.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Vui lòng nhập mật khẩu.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mật khẩu cần ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự.`;
  }
  return null;
}

export function validateDisplayName(displayName: string): string | null {
  const value = displayName.trim();
  if (!value) return 'Vui lòng nhập tên hiển thị.';
  if (value.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Tên hiển thị tối đa ${DISPLAY_NAME_MAX_LENGTH} ký tự.`;
  }
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (!confirmation) return 'Vui lòng nhập lại mật khẩu.';
  return password === confirmation ? null : 'Mật khẩu nhập lại không khớp.';
}
