import * as WebBrowser from 'expo-web-browser';

// Static policy pages on the website. App Review requires the privacy policy
// to be reachable from inside the app, not only from the store listing.
export const LEGAL_URLS = {
  privacy: 'https://polarislab.asia/privacy/',
  terms: 'https://polarislab.asia/terms/',
} as const;

/** Opens a policy page in the in-app browser (SFSafariViewController / Custom Tabs). */
export function openLegalPage(page: keyof typeof LEGAL_URLS): void {
  void WebBrowser.openBrowserAsync(LEGAL_URLS[page]);
}
