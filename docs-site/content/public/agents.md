# Add universal-social-auth to my app

These instructions are for an AI coding agent. Follow them to add browser social login with `universal-social-auth` to the user's existing project.

Documentation: https://usa.zintrust.com
Source: https://github.com/diadal/universal-social-auth
Package: https://www.npmjs.com/package/universal-social-auth

## 1. Inspect the project first

Before you change anything, identify:

- The framework and language: Vanilla JS/TS, Vue 2, Vue 3, Nuxt, React, Angular, Capacitor/Ionic, or another client.
- The package manager: npm, pnpm, or yarn (look for a lockfile).
- Whether `axios` is already installed.
- The app's existing login button, callback route, and backend (Express, Laravel, Zintrust, or other).
- Whether the app is browser-based or a Capacitor mobile app. Browser apps use the popup flow, which requires `window`, so it must run only in the browser. Capacitor apps must use the `universal-social-auth/capacitor` adapter and follow [docs/frameworks/capacitor.md](https://usa.zintrust.com/docs/frameworks/capacitor). The adapter has automated test coverage, but iOS/Android device verification is pending; do not describe it as production-verified. Cordova is not supported.

Ask the user for anything you cannot determine, such as the provider (Google, GitHub, and others) and the production redirect URI.

## 2. Install the package

Use the project's package manager. Install `axios` only if it is missing.

```bash
npm install universal-social-auth axios
```

```bash
pnpm add universal-social-auth axios
```

```bash
yarn add universal-social-auth axios
```

Do not change unrelated dependencies.

## 3. Create one client instance

Create a single instance with the app's Axios instance, and reuse it. Do not create a new instance on every render. In a Capacitor app, do not use the popup flow: call `createCapacitorAdapter` and `setPlatform` from `universal-social-auth/capacitor` once at startup, as described in the Capacitor guide.

```ts
import axios from "axios";
import UniversalSocialauth from "universal-social-auth";

export const auth = new UniversalSocialauth(axios, {
  providers: {
    google: {
      clientId: "YOUR_PUBLIC_CLIENT_ID",
      redirectUri: `${window.location.origin}/callback`
    }
  }
});
```

Use the framework's existing pattern for shared services: a plugin in Vue, a client-only plugin in Nuxt, a service in Angular, or a module-level client in React and vanilla apps. In Nuxt and other SSR apps, create the instance only on the client.

## 4. Start sign-in from a user action

Call `authenticate` from a click handler, so popup blockers allow the window to open.

```ts
import { auth } from "./auth";

export async function signInWithGoogle() {
  return auth.authenticate("google", {
    name: "google",
    oauthType: "2.0",
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: "YOUR_PUBLIC_CLIENT_ID",
    redirectUri: `${window.location.origin}/callback`
  });
}
```

Prefer importing a built-in provider definition from the package when it matches the installed version. Pass only application-specific overrides. Check the installed declarations or the provider catalog to confirm the provider name and options.

## 5. Send the result to the backend

The browser flow returns the callback response to the app. The backend must handle everything sensitive:

- Exchange the authorization code for tokens on the backend. The client secret must never reach the frontend.
- Validate the OAuth `state` value. For OIDC, also validate `nonce`, issuer, audience, signature, and token timing.
- Look up or create the user, apply the app's account-linking policy, and create the app's own session.
- Send the data to the backend over HTTPS only.

Backend recipes are available for Express, Laravel, and Zintrust at https://usa.zintrust.com/docs/recipes/express, https://usa.zintrust.com/docs/recipes/laravel, and https://usa.zintrust.com/docs/recipes/zintrust.

## 6. Configure the provider

- Register the exact redirect URI in the provider console. Match the scheme, host, path, and trailing slash.
- Use HTTPS for every redirect URI outside local development.
- Keep the client secret in server-side environment variables or a secrets manager. Never commit it.
- Do not assume the provider returns an email address or that an email is verified. Handle missing or restricted scopes.

## 7. Never do these

- Do not put a client secret, access token, refresh token, signing key, or other credential in frontend code, logs, or examples.
- Do not log authorization codes, tokens, cookies, or full callback URLs that contain credentials.
- Do not treat a returned authorization code or provider response as an application login session.
- Do not run browser-only sign-in during server rendering.
- Do not add new framework dependencies to the app without a clear reason.

## 8. Verify before you finish

Test each case, and report any you could not run:

- Successful sign-in, and the backend creates the app session.
- The user cancels the popup.
- The popup is blocked (the click handler calls `authenticate` synchronously).
- A redirect URI mismatch returns a clear error.
- A missing `state` or `nonce` is rejected by the backend.
- Build and type-check the project. Run its existing tests.

## 9. Troubleshooting

- **Popup does not open:** Make sure `authenticate` runs directly inside a user click, and check the browser's popup settings.
- **Callback mismatch:** Compare the app, the provider console, and the backend for the exact redirect URI.
- **Provider error:** Check the provider ID spelling, OAuth version (`1.0` or `2.0`), client ID, endpoint, and scopes.
- **Errors in logs:** Report the provider, framework, runtime, redirect URI shape, and a sanitized error message. Never include credentials.

## 10. Report back

When finished, summarize for the user:

- Files you created or changed.
- The provider(s) configured and the redirect URI(s) the user must register.
- The backend work still required from the user, such as storing the client secret.
- The tests you ran and their results.
