// Sentry's serializer stamps bundles and source maps with matching Debug IDs,
// so stack traces from OTA bundles can be symbolicated.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
