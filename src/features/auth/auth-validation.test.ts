import { describe, expect, it } from 'vitest';

import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from './auth-validation';

describe('auth validation', () => {
  it('validates email shape', () => {
    expect(validateEmail('')).not.toBeNull();
    expect(validateEmail('not-an-email')).not.toBeNull();
    expect(validateEmail('  dev@polaris.vn ')).toBeNull();
  });

  it('enforces backend password length (8..128)', () => {
    expect(validatePassword('1234567')).not.toBeNull();
    expect(validatePassword('12345678')).toBeNull();
    expect(validatePassword('x'.repeat(129))).not.toBeNull();
  });

  it('requires visible display name up to 80 chars', () => {
    expect(validateDisplayName('   ')).not.toBeNull();
    expect(validateDisplayName('Nhật')).toBeNull();
    expect(validateDisplayName('x'.repeat(81))).not.toBeNull();
  });

  it('checks password confirmation', () => {
    expect(validatePasswordConfirmation('abcdefgh', 'abcdefgx')).not.toBeNull();
    expect(validatePasswordConfirmation('abcdefgh', 'abcdefgh')).toBeNull();
  });
});
