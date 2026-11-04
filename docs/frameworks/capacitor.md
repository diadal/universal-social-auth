# Capacitor (mobile and hybrid apps)

Status: **adapter implemented, device verification pending.** The adapter builds and is
covered by Jest. Verify on iOS and Android devices before shipping.

## Adapter (`universal-social-auth/capacitor`)

Native branches run through the system browser and a secure store for pending sign-ins.
Web code paths are unchanged.

```ts
import { setPlatform, resumePendingSignIn } from 'universal-social-auth';
import { createCapacitorAdapter } from 'universal-social-auth/capacitor';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

const adapter = createCapacitorAdapter({
  platform: 'ios', // or 'android'
  browser: Browser,
  app: App,
  secureStorage: mySecureStorage // a KeyValueStore backed by Keychain or Keystore
});
setPlatform(adapter);

// On a cold launch from a callback URL, resume the saved sign-in.
// It returns the provider and callback params. Send them to your backend for the token exchange.
const launch = await App.getLaunchUrl();
if (launch?.url) {
  const resumed = await resumePendingSignIn(launch.url, adapter.native!, redirectUri);
}
```

Set per-platform `clientId` and `redirectUri` with the `platforms` provider option
(`web`, `ios`, `android`). A platform override takes precedence over the base value.

## Read this first

Popup-based OAuth is unreliable inside native WebViews. Many providers block
embedded WebViews entirely (Google does). Use the system browser instead:

- Open the authorization URL in the system browser with
  `@capacitor/browser`.
- Return to the app with a custom URL scheme or universal link using
  `@capacitor/app` (`appUrlOpen`).
- Exchange the code on your backend, never in the app.

## Sketch

```ts
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

// Build the authorization URL on the backend or with your provider's documented URL format.
async function signIn(authorizeUrl: string) {
  await Browser.open({ url: authorizeUrl, windowName: '_self' });
}

App.addListener('appUrlOpen', ({ url }) => {
  const params = new URL(url).searchParams;
  // Send params.get('code') and params.get('state') to your backend.
});
```

Keep PKCE and state validation in the flow. Store the `codeVerifier` in memory or
secure storage, never in plain `localStorage`.

Versions to check: `@capacitor/core` 8.x, `@capacitor/browser`, `@capacitor/app`.
