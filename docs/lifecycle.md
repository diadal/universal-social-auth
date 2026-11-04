# Session and account lifecycle

`universal-social-auth` runs the browser side of an OAuth or OIDC login. It opens
the provider popup, validates the callback, and returns the provider's
response. It does not manage your application's session, store accounts, or
call provider APIs on your behalf. This page describes which parts of the
lifecycle are your responsibility.

## What the library does

- Opens the authorization popup and reads the callback (`code`, `state`, and
  any error parameters).
- When polling for a callback, closes the popup after five minutes by default.
  Configure a positive, finite `callbackTimeout` for slower providers.
- Generates a cryptographically random `state` for each OAuth 2.0 sign-in by
  default and requires the callback to return the same value. A custom `state`
  must be a function that returns a fresh, unpredictable value for each attempt;
  literal state strings are rejected.
- Optionally adds PKCE (`pkce: true`, S256) and an OIDC nonce (`oidc: true`).
  The verifier and nonce are returned to you so your backend can exchange the
  code and validate the ID token.
- Emits lifecycle hooks (`onStart`, `onComplete`, `onCancel`, `onError`) for UI
  state. Hooks are observers only; their exceptions are ignored.
- Keeps web transaction state in the active sign-in instance and returns the
  PKCE verifier and nonce with the callback result. Native flows persist the
  verifier and nonce in the platform transaction store until the callback is
  consumed.

## What the library does not do

- Refresh-token rotation.
- Logout, account unlinking, or account linking.
- Provider revocation.
- Long-term session storage. Any token value the library returns to you is
  yours to store.

When a backend accepts the authorization code directly, it must also bind the
expected state to the user's server-side session and consume it once. Client-side
callback validation does not protect a backend endpoint that accepts an
attacker-supplied code and verifier without checking its own transaction state.

## Responsibilities by action

| Action | Who handles it | Notes |
| --- | --- | --- |
| Sign in | Library (browser) + your backend | Backend exchanges `code` with the `codeVerifier`, and validates the ID token `nonce`, `iss`, `aud`, and `exp`. `validateIdTokenClaims` and `discoverOidc` help. |
| Sign out of your app | Your backend | Invalidate the server-side session and clear the session cookie. Clearing browser storage alone does not end the session. |
| Unlink a provider account | Your backend + provider API | Remove the link in your database. Provider-side access is not removed unless you also revoke it. |
| Revoke provider access | Your backend + provider API | Call the provider's revocation endpoint with the token. Revoking an access token does not necessarily revoke the refresh token; revoke both when present. |
| Refresh tokens | Your backend | Rotate refresh tokens on use and store the new one. Reuse of an old refresh token should invalidate the family. |
| Email change | Your backend | Re-verify the email at the provider or your app before trusting the new address for account linking. |

## Session storage guidance

- **Production:** keep provider tokens and your application session on the
  server. Send the browser an `HttpOnly`, `Secure`, `SameSite` session cookie.
  The browser then never reads a token, which limits XSS impact.
- **Browser-only apps:** the default `localStorage` is convenient but readable
  by any script on the page. Use it only when you accept that risk, and keep
  token lifetimes short.
- **Revocation limits:** ending the local session does not revoke the grant at
  the provider. A user who signed out can still be signed in again without a
  prompt until the provider session expires or the grant is revoked.
