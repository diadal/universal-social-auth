# Zintrust recipe

Zintrust (`@zintrust/core`) has no built-in social login, so this recipe uses its
router and controller APIs. The browser runs `universal-social-auth`. The Zintrust
server exchanges the code and keeps the client secret.

## 1. Route

`routes/api.ts`:

```typescript
import { router } from '@zintrust/core';
import { SocialAuthController } from '../app/Controllers/SocialAuthController';

router.post('/auth/google', 'SocialAuthController@google');
```

## 2. Controller

`app/Controllers/SocialAuthController.ts` (sealed namespace pattern from the Zintrust docs):

```typescript
import type { IRequest, IResponse } from '@zintrust/core';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export const SocialAuthController = Object.freeze({
  create() {
    return {
      async google(req: IRequest, res: IResponse): Promise<void> {
        const body = req.body as {
          code?: string;
          codeVerifier?: string;
          redirectUri?: string;
        };

        if (!body.code || !body.codeVerifier || !body.redirectUri) {
          return res.status(422).json({ message: 'Missing code, codeVerifier, or redirectUri' });
        }

        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: body.code,
            client_id: process.env.GOOGLE_CLIENT_ID ?? '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            redirect_uri: body.redirectUri,
            grant_type: 'authorization_code',
            code_verifier: body.codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          return res.status(401).json({ message: 'Token exchange failed' });
        }

        // Verify the id_token (signature, iss, aud, nonce) before trusting it.
        // Then create or log in the local user and issue your app session.
        return res.json({ ok: true });
      },
    };
  },
});
```

Check the exact `res.status()` and `res.json()` signatures in your installed
`@zintrust/core` version. This recipe was written against its routing and
controller docs and has not been run against a live Zintrust app.

Related: [Express recipe](./express.md), [Laravel recipe](./laravel.md).
