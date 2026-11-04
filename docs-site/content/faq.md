---
title: FAQ
description: "Short, direct answers about universal-social-auth: what it is, which providers it supports, how it stays secure, and which backends it works with."
---

# Frequently asked questions

### What is universal-social-auth?

universal-social-auth is an open-source TypeScript library for social login in the browser. It handles OAuth 1.0, OAuth 2.0, and OpenID Connect (OIDC) with PKCE, and it keeps your client secret on your backend.

### Which login providers does it support?

It ships with built-in configs for Google, GitHub, Microsoft, Facebook, Apple, Discord, LinkedIn, and Twitter/X, and it accepts custom OAuth 1.0, OAuth 2.0, and OIDC providers such as Okta, Microsoft Entra ID, and Keycloak. The full list is in the provider catalog.

### Does it store or expose the client secret?

No. The browser only handles the authorization redirect or popup. The token exchange that needs the client secret happens on your backend, using one of the recipes in the docs.

### Does it protect against CSRF and code interception?

Yes. It generates a `state` value for every login and validates it on return, and it uses PKCE (S256) for OAuth 2.0 and OIDC. OIDC also supports a `nonce` check on the ID token.

### Which backends does it work with?

The docs include recipes for Express, Laravel, Zintrust, and other backends. Any server that can receive the authorization code and POST it to the provider's token endpoint can be used.

### Does it work with Vue, React, Angular, Nuxt, or Capacitor?

Yes. Vue 3 and React examples are built and included in the repository. Nuxt, Angular, and Capacitor have integration guides that show the snippets to use.

### How do I install it?

Run `npm install universal-social-auth`. The package supports Node.js 20.19 or later and ships ESM and CommonJS builds.

### Is it free to use?

Yes. The library is MIT licensed. If it saves you time, you can support its development through [GitHub Sponsors or Patreon](/sponsor).

### Where can I report a bug or ask a question?

Open an issue on [GitHub](https://github.com/diadal/universal-social-auth/issues). Security problems should be reported privately, as described in the repository's security policy.
