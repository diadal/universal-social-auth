# Capacitor (mobile and hybrid apps)

Status: **snippet guide, not a built example.** Verify on a device before shipping.

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
