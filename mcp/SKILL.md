---
name: universal-social-auth
description: Integrate, configure, troubleshoot, or extend the universal-social-auth browser OAuth library in JavaScript and TypeScript applications. Use when working with its providers, popup flow, Axios setup, Vue, Nuxt, React, Angular, Capacitor, Laravel Socialite, or backend callback boundary.
---

# Universal Social Auth Agent Skill

Use this guide when helping a developer integrate or maintain
`universal-social-auth`. Ground recommendations in the installed package
version and the project's existing framework conventions. Do not assume that
the library implements a backend OAuth callback or application session.

## Package model

- The package initiates OAuth 1.0a or OAuth 2.0 authorization from a browser.
- It uses an Axios instance for OAuth 1.0a request-token and response requests.
- OAuth 2.0 opens the provider authorization endpoint in a popup and returns the callback response to the application.
- The application backend is responsible for securely exchanging authorization codes, validating identity, linking accounts, and creating its own session.
- The library is framework-agnostic. Vue examples are provided, but React, Angular, vanilla JavaScript, and other client apps can use the same instance and `authenticate` method.
- Provider metadata and named exports are available from the package root. Inspect the installed declarations or source when an export or option is uncertain.

## Supported built-in providers

The provider catalog includes Apple, Facebook, Google, GitHub, Instagram,
Twitter, Bitbucket, LinkedIn, VKontakte, Microsoft Live, Discord, Twitch,
Microsoft, GitLab, Slack, Spotify, Reddit, Dropbox, and Amazon. Generic OAuth 1.0
and OAuth 2.0 templates are also exported. Provider availability and provider
requirements can change; consult the installed `Providers` catalog rather than
relying on a hard-coded list.

## Standard integration

1. Confirm the app is a browser application and identify its framework, runtime, callback route, backend, and installed package version.
2. Install `universal-social-auth` and Axios if the project does not already have them.
3. Configure the provider in the OAuth provider console and the backend. Keep client secrets on the backend.
4. Create one library instance with the app's Axios instance and provider options.
5. Call `authenticate(providerName, providerConfig)` from a user gesture, such as a login button click. Popup blockers may prevent calls that are not tied to a user gesture.
6. Handle the response according to the provider and backend contract. Send authorization material to the application's trusted backend over HTTPS.
7. Test cancellation, popup blocking, callback mismatches, provider errors, and the production redirect URI.

Example:

```ts
import axios from "axios";
import UniversalSocialauth from "universal-social-auth";

const auth = new UniversalSocialauth(axios, {
  providers: {
    github: {
      clientId: "PUBLIC_CLIENT_ID",
      redirectUri: "https://app.example.com/auth/callback"
    }
  }
});

async function signInWithGithub() {
  const response = await auth.authenticate("github", {
    name: "github",
    oauthType: "2.0",
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    clientId: "PUBLIC_CLIENT_ID",
    redirectUri: "https://app.example.com/auth/callback"
  });
  return response;
}
```

Prefer importing the provider config from the package when that matches the
project's installed version, for example `import { Github } from
'universal-social-auth'`, and pass application-specific overrides separately.
Avoid duplicating the full provider definition without a concrete reason.

## Framework guidance

- **Vanilla JavaScript/TypeScript:** instantiate the library in client code and call it from an explicit login action.
- **Vue 2:** provide the instance through the existing application plugin or `Vue.prototype` convention.
- **Vue 3:** use the project's established injection or plugin pattern; avoid creating a new instance per render.
- **Nuxt and SSR:** create/use the instance in a client-only plugin. Importing is designed to avoid touching browser globals at module load, but the popup flow itself requires `window` and must only be invoked in a browser.
- **React:** keep the instance in a client-side module/provider or service and start authentication from a user action, not during render or an effect.
- **Angular:** wrap the instance in an injectable service and call it from an explicit user action.
- **Capacitor and other native shells:** configure platform deep links and ensure the callback returns to the same app/domain expected by the OAuth provider. Treat callback URLs as untrusted input and validate them before forwarding data.

For framework-specific typing and lifecycle details, inspect the project's
actual version and patterns instead of adding framework dependencies to this
library.

## Backend boundary and security

- Never place a client secret, provider access token, refresh token, signing key, or private credential in frontend code or MCP input.
- Treat the browser response and callback parameters as untrusted. Validate OAuth `state`; for OIDC, validate `nonce`, issuer, audience, signature, and token timing on the backend.
- Use exact registered redirect URIs and HTTPS outside local development.
- Exchange authorization codes on the backend when the provider flow requires a secret. Do not treat a returned code as an application login session.
- Apply CSRF protection, rate limits, secure cookie/session settings, and explicit account-linking policy in the backend.
- Do not infer that a provider returns an email address or that an email is verified. Handle missing/restricted scopes and provider-specific consent behavior.
- The optional 2FA/OTP pattern in older README examples is application-owned. This package does not enforce MFA or verify OTP values.
- Do not log authorization codes, tokens, cookies, secrets, or full callback URLs containing credentials.

## Configuration and troubleshooting

- Provider-specific values override the built-in provider defaults through the `providers` option and/or the config passed to `authenticate`.
- Verify provider ID spelling, OAuth version, client ID, authorization endpoint, redirect URI, scope, and response mode against the provider console and installed catalog.
- For a popup that does not open, trigger `authenticate` synchronously from a user gesture and check browser popup policy.
- For a callback mismatch, compare the exact scheme, hostname, path, and trailing slash in the app, provider console, and backend.
- For OAuth 1.0a, confirm the backend's request-token endpoint and response contract; those calls use Axios and configured request/response data keys.
- For OAuth 2.0, confirm the callback route returns the expected response to the popup and that the configured redirect URI matches it.
- For storage issues, inspect `storageType` and the browser context. SSR code must not invoke browser-only flows during server rendering.
- Report errors without exposing credentials. Reduce to the provider, framework, runtime, redirect URI shape, and sanitized error message.

## Extension workflow

When adding a provider, follow the existing provider catalog shape, preserve
OAuth 1.0/2.0 conventions, document provider-specific scopes and callback
requirements, and add tests for the catalog/config behavior. Do not copy secret
values into defaults. When adding a framework integration, keep core runtime
framework-agnostic and document the integration separately.

## MCP tools

The MCP server exposes `list_providers`, `get_provider_config`, and
`get_integration_guide`, plus this skill as a resource. Use these for current
catalog data and framework/backend guidance. The server is metadata-only: it
does not initiate OAuth, access project files, store secrets, or make network
requests to identity providers.
