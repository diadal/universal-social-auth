# Other backends

The contract is the same for every backend. The browser sends a JSON body with the
values from the successful `authenticate` result, and the server does the token
exchange.

## Request the server receives

```json
{
  "code": "4/0A...",
  "state": "…",
  "codeVerifier": "…",
  "nonce": "…"
}
```

## Server checklist

1. Accept only `POST` with JSON and limit the body size.
2. Check that `code`, `codeVerifier`, and `nonce` are present and well-formed.
3. Exchange the code at the provider's token endpoint with `client_secret`,
   `redirect_uri`, `grant_type=authorization_code`, and `code_verifier`.
4. Verify the ID token: signature (from the JWKS), `iss`, `aud`, `exp`, and `nonce`.
5. Map the verified identity to a local user and issue your own session or token.
6. Never return the provider access token or client secret to the browser.

## Node frameworks

- **Express**: see [Express recipe](./express.md).
- **Fastify**: register a `POST` route with a JSON schema and reuse the same
  exchange function. Keep the schema strict (`additionalProperties: false`).
- **NestJS**: put the exchange in a service and call it from a controller with a
  DTO and `class-validator`.

## Other languages

Use the server library for the language (for example Django `social-auth-app`,
Rails `omniauth`, Go `golang.org/x/oauth2`). Check the library's PKCE support
before relying on it.

See also: [Laravel](./laravel.md), [Zintrust](./zintrust.md).
