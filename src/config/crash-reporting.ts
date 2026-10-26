import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

import { appEnv } from './env';

/**
 * Starts Sentry when a DSN is configured; otherwise a no-op. The DSN comes
 * from EXPO_PUBLIC_SENTRY_DSN, which is inlined into the JS bundle, so
 * reporting can be switched on with an OTA update instead of a new binary.
 *
 * Events are tagged with the running EAS Update so a crash can be traced
 * back to the exact OTA bundle that caused it.
 */
export function initCrashReporting(): void {
  if (!appEnv.sentryDsn) return;

  Sentry.init({
    dsn: appEnv.sentryDsn,
    environment: Updates.channel ?? (__DEV__ ? 'development' : 'unknown'),
    enabled: !__DEV__,
  });

  const scope = Sentry.getGlobalScope();
  scope.setTag('expo-update-id', Updates.updateId);
  scope.setTag('expo-is-embedded-update', Updates.isEmbeddedLaunch);

  const manifest = Updates.manifest;
  const metadata = 'metadata' in manifest ? manifest.metadata : undefined;
  const updateGroup =
    metadata && 'updateGroup' in metadata ? metadata.updateGroup : undefined;
  if (typeof updateGroup === 'string') {
    scope.setTag('expo-update-group-id', updateGroup);
  }
}
