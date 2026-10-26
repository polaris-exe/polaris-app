import { Redirect } from 'expo-router';

/**
 * On Android the OAuth redirect `polaris://oauth/callback#…` can also reach
 * the router as a deep link while `openAuthSessionAsync` resolves the
 * tokens. This route only exists so that link never lands on "Unmatched
 * Route"; "/" then redirects by auth state.
 */
export default function OAuthCallbackRoute() {
  return <Redirect href="/" />;
}
