import type { AuthSessionResponse, CurrentUserResponse } from '@/contracts';
import { apiClient } from '@/api/default-api-client';

import {
  parseAuthSessionResponse,
  parseRegisterResponse,
  type RegisterResult,
} from './parse-auth-session-response';

export async function apiRegister(
  email: string,
  displayName: string,
  password: string,
): Promise<RegisterResult> {
  const result = await apiClient.post('/auth/register', {
    display_name: displayName,
    email,
    password,
  });
  return parseRegisterResponse(result, email);
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthSessionResponse> {
  const result = await apiClient.post('/auth/login', { email, password });
  return parseAuthSessionResponse(result, '/auth/login');
}

export async function apiLogout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function apiGetMe(): Promise<CurrentUserResponse> {
  const result = await apiClient.get('/me');
  return result as CurrentUserResponse;
}

/** Backend emails a reset link to the web app; always 2xx to avoid leaking accounts. */
export async function apiForgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}
