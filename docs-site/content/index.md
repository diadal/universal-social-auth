---
layout: home

hero:
  name: universal-social-auth
  text: Social login for the browser
  tagline: OAuth 1.0, OAuth 2.0, and OIDC with PKCE, state checks, and lifecycle hooks. Your backend keeps the client secret.
  image:
    src: /logo.png
    alt: universal-social-auth logo
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: Backend recipes
      link: /docs/recipes/express
    - theme: alt
      text: Sponsor
      link: /sponsor

features:
  - title: Browser-first
    details: One client instance. Popup or redirect flow. No client secret in the browser.
  - title: Secure defaults
    details: PKCE, state validation, and OIDC nonce support. Redirect URIs are checked.
  - title: Works with your backend
    details: Recipes for Express, Laravel, Zintrust, and other backends, plus OIDC providers such as Okta, Entra ID, and Keycloak.
---

<div class="home-badges">

[![npm version](https://img.shields.io/npm/v/universal-social-auth?color=6b3dff&label=npm)](https://www.npmjs.com/package/universal-social-auth)
[![license](https://img.shields.io/npm/l/universal-social-auth?color=1a1b4d)](https://github.com/diadal/universal-social-auth/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/source-GitHub-1a1b4d?logo=github)](https://github.com/diadal/universal-social-auth)

</div>

## Install in seconds

::: code-group

```bash [npm]
npm install universal-social-auth axios
```

```bash [pnpm]
pnpm add universal-social-auth axios
```

```bash [yarn]
yarn add universal-social-auth axios
```

:::

## See it in code

::: code-group

```ts [Browser]
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

```bash [Server]
# Your backend exchanges the code and keeps the client secret.
# Pick a recipe for your stack:
#   /docs/recipes/express
#   /docs/recipes/laravel
#   /docs/recipes/zintrust
```

:::

<div class="home-cta">

**Ready to ship?** Read the [getting started guide](/getting-started), browse the [backend recipes](/docs/recipes/express), or [support the project](/sponsor).

</div>
