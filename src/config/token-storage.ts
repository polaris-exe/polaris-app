import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'polaris.access_token';
const REFRESH_TOKEN_KEY = 'polaris.refresh_token';

interface SessionTokens {
  readonly access_token: string;
  readonly refresh_token?: string;
}

type ClearedListener = () => void;

/**
 * Tokens live in SecureStore (Keychain / Keystore). SecureStore is async but
 * ApiClient's tokenProvider is sync, so values are mirrored in memory after
 * `hydrate()` and every write updates both.
 */
class TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private readonly clearedListeners = new Set<ClearedListener>();

  async hydrate(): Promise<void> {
    const [access, refresh] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * The backend rotates refresh tokens and burns the whole session family if
   * an old one is replayed, so the new pair must be stored before anything
   * else can read the old one.
   */
  async persist(session: SessionTokens): Promise<void> {
    this.accessToken = session.access_token;
    if (session.refresh_token) {
      this.refreshToken = session.refresh_token;
    }
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.access_token),
      session.refresh_token
        ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refresh_token)
        : Promise.resolve(),
    ]);
  }

  async clear(): Promise<void> {
    const hadSession = this.accessToken !== null || this.refreshToken !== null;
    this.accessToken = null;
    this.refreshToken = null;
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
    if (hadSession) {
      this.clearedListeners.forEach((listener) => listener());
    }
  }

  /** Notified when the session is dropped (e.g. refresh token rejected). */
  onCleared(listener: ClearedListener): () => void {
    this.clearedListeners.add(listener);
    return () => this.clearedListeners.delete(listener);
  }
}

export const tokenStorage = new TokenStorage();
