# Express backend recipe

The browser (see [examples/vanilla-ts](../../examples/vanilla-ts)) sends the
authorization `code`, `state`, `codeVerifier` and `nonce` to this endpoint. The
backend exchanges the code with the provider, verifies the ID token, and creates
the session. The client secret never leaves the server.

## 1. Install

```bash
npm install express jose
```

`jose` verifies the ID token signature against the provider's JWKS.
`validateIdTokenClaims` from `universal-social-auth` checks `iss`, `aud`, `exp`
and `nonce`. It does **not** check signatures, so do not rely on it alone.

## 2. Exchange the code and verify the ID token

```ts
import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { discoverOidc, validateIdTokenClaims } from 'universal-social-auth';
import axios from 'axios';

const app = express();
app.use(express.json());

const ISSUER = 'https://accounts.google.com';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!; // must match the browser's redirectUri

let discoveryPromise: ReturnType<typeof discoverOidc> | undefined;
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

async function getProviderMetadata() {
  discoveryPromise ??= discoverOidc(ISSUER, axios);
  const doc = await discoveryPromise;
  if (!doc.token_endpoint || !doc.jwks_uri) {
    throw new Error('Discovery document is missing token_endpoint or jwks_uri');
  }
  jwks ??= createRemoteJWKSet(new URL(doc.jwks_uri));
  return { tokenEndpoint: doc.token_endpoint, jwks };
}

app.post('/api/auth/google', async (req, res) => {
  const { code, codeVerifier, nonce } = req.body ?? {};
  if (typeof code !== 'string' || typeof codeVerifier !== 'string' || typeof nonce !== 'string') {
    return res.status(400).json({ error: 'invalid_request' });
  }

  try {
    const { tokenEndpoint, jwks } = await getProviderMetadata();

    const tokenResponse = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code_verifier: codeVerifier
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const idToken: string | undefined = tokenResponse.data.id_token;
    if (!idToken) {
      return res.status(401).json({ error: 'missing_id_token' });
    }

    // 1) Signature, issuer, audience and expiry (jose).
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: ISSUER,
      audience: CLIENT_ID
    });

    // 2) Nonce and claim checks (universal-social-auth). Throws AuthError on failure.
    validateIdTokenClaims(payload as Record<string, unknown>, {
      issuer: ISSUER,
      audience: CLIENT_ID,
      nonce
    });

    // Create your session here (for example with express-session). Use the verified `payload.sub` as the stable user id.
    return res.json({ ok: true, sub: payload.sub });
  } catch (err) {
    // Log details server-side; return a generic message to the client.
    console.error('Google sign-in failed', err);
    return res.status(401).json({ error: 'sign_in_failed' });
  }
});

app.listen(3000);
```

## Notes

- **PKCE:** `codeVerifier` is sent to the token endpoint. Google requires it when
  the authorization request used a `code_challenge`.
- **State:** the browser library checks `state` before it returns the code.
  Repeat the check on the server only if your flow passes `state` through the
  backend.
- **Nonce:** `nonce` must match the value sent in the authorization request.
  Store it server-side per attempt if you need stronger replay protection.
- **Session:** the final step is a placeholder. Create your session there with
  your session library (for example `express-session`).
- **Secrets:** `GOOGLE_CLIENT_SECRET` must stay in server environment variables.
  Never ship it to the browser.
- **Lifecycle:** for sign-out, unlinking and revocation rules, see
  [docs/lifecycle.md](../lifecycle.md).

This snippet was reviewed against the library API but was not compiled or run
against a live Google project.
