# Getting started

## Install

```bash
npm install universal-social-auth axios
```

Requires Node.js 20.19 or newer for tooling. The browser bundle has no Node dependency.

## Create the client

Create one instance in the browser. Pass your Axios instance and the provider settings.

```ts
import axios from 'axios';
import UniversalSocialauth from 'universal-social-auth';

const auth = new UniversalSocialauth(axios, {
  providers: {
    google: {
      url: '/api/auth/google',
      clientId: 'YOUR_PUBLIC_CLIENT_ID',
      redirectUri: `${window.location.origin}/callback`
    }
  }
});
```

## Sign in

Call `authenticate` from a user action such as a button click. Browsers block popups
that open without a user gesture.

```ts
const result = await auth.authenticate('google', { pkce: true, oidc: true } as never);
if (result instanceof Error) {
  // Show the error and let the user try again.
}
```

## Send the result to your backend

The browser sends the code and verifier to your server. Your server exchanges the code
with the provider and creates the session. See the [recipes](/docs/recipes/express).

## Next steps

- [Lifecycle hooks](/docs/lifecycle) for analytics and UI state.
- [Accessibility](/docs/accessibility) for focus, live regions, and error recovery.
- Framework guides: [Nuxt](/docs/frameworks/nuxt), [Angular](/docs/frameworks/angular), [Capacitor](/docs/frameworks/capacitor).
