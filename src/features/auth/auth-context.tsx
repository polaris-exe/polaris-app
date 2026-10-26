import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AuthUserProfile } from '@/contracts';
import { ApiClientError } from '@/api/api-client';
import { refreshSessionTokens } from '@/api/session-refresh';
import { tokenStorage } from '@/config/token-storage';

import { apiGetMe, apiLogin, apiLogout, apiRegister } from './auth-api';
import type { OAuthProvider } from './oauth-callback-url';
import { runOAuthSignIn } from './oauth-sign-in';

interface AuthContextValue {
  readonly user: AuthUserProfile | null;
  /** True until the stored session has been read and verified on launch. */
  readonly isRestoring: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  /** Resolves 'verification_required' when the account must confirm its email first. */
  readonly register: (
    email: string,
    displayName: string,
    password: string,
  ) => Promise<'signed_in' | 'verification_required'>;
  /** Resolves 'cancelled' when the user closes the provider page. */
  readonly signInWithOAuth: (
    provider: OAuthProvider,
  ) => Promise<'signed_in' | 'cancelled'>;
  readonly logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore the session saved in SecureStore on app launch.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        await tokenStorage.hydrate();
        let token = tokenStorage.getAccessToken();
        if (!token && tokenStorage.getRefreshToken()) {
          token = await refreshSessionTokens();
        }
        if (!token) return;

        const response = await apiGetMe();
        if (!cancelled) setUser(response.user);
      } catch (error) {
        // apiGetMe already retried via the refresher on 401, so an HTTP error
        // means the session is dead. Network errors keep the tokens so the
        // next launch can recover.
        if (error instanceof ApiClientError && error.kind === 'http') {
          await tokenStorage.clear();
        }
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // A rejected refresh token anywhere in the app drops the session.
  useEffect(
    () =>
      tokenStorage.onCleared(() => {
        setUser(null);
        queryClient.clear();
      }),
    [queryClient],
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email.trim(), password);
    await tokenStorage.persist(response.session);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (email: string, displayName: string, password: string) => {
      const result = await apiRegister(
        email.trim(),
        displayName.trim(),
        password,
      );
      if (result.kind === 'verification_required') {
        return 'verification_required';
      }
      await tokenStorage.persist(result.response.session);
      setUser(result.response.user);
      return 'signed_in';
    },
    [],
  );

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const outcome = await runOAuthSignIn(provider);
    if (outcome.kind === 'cancelled') return 'cancelled' as const;

    // The redirect carries only tokens; fetch the profile with them.
    await tokenStorage.persist(outcome);
    try {
      const response = await apiGetMe();
      setUser(response.user);
      return 'signed_in' as const;
    } catch (error) {
      await tokenStorage.clear();
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore server/network errors — local state is cleared regardless.
    }
    await tokenStorage.clear();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, isRestoring, login, register, signInWithOAuth, logout }),
    [user, isRestoring, login, register, signInWithOAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
