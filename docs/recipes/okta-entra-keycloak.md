# Okta, Microsoft Entra ID, and Keycloak

These are OIDC providers. Use the generic OIDC path in the library and point it
at the provider's discovery document. Replace each placeholder with your tenant
values. Never commit real values.

## Common settings

| Setting | Meaning |
|---|---|
| `ISSUER` | Discovery base URL (`/.well-known/openid-configuration` is appended) |
| `CLIENT_ID` | Public client identifier |
| `REDIRECT_URI` | Must be registered with the provider exactly |
| `scope` | Include `openid email profile` |

## Okta

- Issuer: `https://YOUR_OKTA_DOMAIN/oauth2/default` (or a custom authorization server).
- Create a Single-Page App for the browser client and a Web app for the backend.
- Use `PKCE` and the authorization code flow.

## Microsoft Entra ID

- Issuer: `https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0`.
- Register the redirect URI as a SPA platform.
- Verify the `tid` claim if you accept multiple tenants.

## Keycloak

- Issuer: `https://YOUR_HOST/realms/YOUR_REALM`.
- Create a client with PKCE (`S256`) and add the redirect URI.
- For a public client, do not set a client secret in the browser.

## Verification on the server

Verify the ID token signature with the JWKS from the discovery document, then check
`iss`, `aud`, `exp`, and `nonce`. Do not trust the claims until verification
passes.

Provider-specific claims and endpoints can change. Confirm against the
provider's current documentation before going live.
