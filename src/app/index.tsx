import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';

/**
 * Entry route "/". It sits outside both Stack.Protected groups so the app
 * always has a matching screen at launch (or when a deep link drops the
 * user on "/"), then sends them to the right place for their auth state.
 */
export default function IndexRoute() {
  const { user, isRestoring } = useAuth();

  // Splash screen is still visible while the session is being restored.
  if (isRestoring) return null;

  return <Redirect href={user ? '/community' : '/login'} />;
}
