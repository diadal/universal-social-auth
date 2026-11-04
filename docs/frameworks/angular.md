# Angular

Status: **snippet guide, not a built example.** It has not been compiled inside an
Angular CLI project yet.

## Rule: keep the popup in a click handler and out of SSR

Angular Universal (SSR) renders on the server, where `window` does not exist.
Create the client in the browser only, using `isPlatformBrowser`.

```ts
// social-auth.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import UniversalSocialauth from 'universal-social-auth';

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private auth?: UniversalSocialauth<HttpClient>;

  private client(): UniversalSocialauth<HttpClient> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Social sign-in is only available in the browser.');
    }
    this.auth ??= new UniversalSocialauth(this.http, {
      providers: {
        google: {
          url: '/api/auth/google',
          clientId: 'YOUR_GOOGLE_CLIENT_ID',
          redirectUri: `${window.location.origin}/auth/callback`
        }
      }
    });
    return this.auth;
  }

  signIn() {
    return this.client().authenticate('google', { pkce: true, oidc: true } as never);
  }
}
```

Call `signIn()` from a `(click)` handler in a component. Do not call it from a
resolver, guard, or constructor, because those can run during SSR.

The generic type parameter is the HTTP client type. Check the actual constructor
signature in your installed version before relying on it.
