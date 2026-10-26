import { ApiClientError } from './api-client';

/** Context-specific overrides, keyed by HTTP status. */
export type StatusMessages = Partial<Record<number, string>>;

/**
 * Turns any thrown value into a Vietnamese message safe to show the user.
 * Backend messages are English and technical, so known statuses are mapped
 * here; callers pass overrides for statuses that mean something specific in
 * their flow (e.g. 401 on login = wrong credentials).
 */
export function toUserMessage(
  error: unknown,
  overrides: StatusMessages = {},
): string {
  logInDev(error);

  if (!(error instanceof ApiClientError)) {
    return withDevDetail('Đã có lỗi xảy ra. Vui lòng thử lại.', error);
  }
  if (error.kind === 'network') {
    return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
  }

  const status = error.statusCode ?? 0;
  const override = overrides[status];
  if (override) {
    return override;
  }

  if (status === 429) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  if (status === 404) return 'Không tìm thấy nội dung.';
  if (status === 400 || status === 422) return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
  return withDevDetail('Đã có lỗi xảy ra. Vui lòng thử lại.', error);
}

// `__DEV__` is a React Native global; it is undefined under Vitest.
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/** Full error in the Metro terminal while developing. */
function logInDev(error: unknown): void {
  if (isDev) console.warn('[api-error]', error);
}

/** Dev builds append the raw error so generic messages stay debuggable. */
function withDevDetail(message: string, error: unknown): string {
  if (!isDev) return message;
  const detail =
    error instanceof ApiClientError
      ? `${error.kind} ${error.statusCode ?? ''} ${error.code}: ${error.message}`
      : error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
  return `${message}\n[dev] ${detail}`;
}
