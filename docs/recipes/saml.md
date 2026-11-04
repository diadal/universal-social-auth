# SAML

SAML is not supported by `universal-social-auth`. It is a browser-redirect flow
that needs a server-side service provider (SP) and XML signature checks. Do not
try to implement it in the browser.

## Evaluation

| Option | When to use |
|---|---|
| OIDC (Okta, Entra ID, Keycloak) | Preferred. Use the [OIDC recipe](./okta-entra-keycloak.md). |
| SAML via an IdP bridge | If the customer requires SAML, put an OIDC bridge or the IdP's OIDC endpoint in front. |
| Server SAML library | Use `passport-saml` (Node), `php-saml`, or `python3-saml` on the backend. |

## Requirements if you build it on the server

- Validate the XML signature and the `Audience`, `Issuer`, `NotBefore`, and
  `NotOnOrAfter` conditions.
- Reject unsigned assertions and replayed `InResponseTo` values.
- Keep the SP private key on the server.

This is documented as an evaluation only. No SAML code ships in the library.
