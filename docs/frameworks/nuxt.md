# Nuxt

Status: **snippet guide, not a built example.** The code below follows the same
client-only pattern as the tested [Vue 3 example](../../examples/vue3-vite/), but
it has not been built inside a Nuxt app yet.

## Rule: create the client on the browser only

`universal-social-auth` opens a popup and reads `window`. Nuxt renders on the
server first, so create the client inside a client-only plugin or a `.client.ts`
file.

```ts
// plugins/social-auth.client.ts
import axios from 'axios';
import UniversalSocialauth from 'universal-social-auth';

export default defineNuxtPlugin(() => {
  const auth = new UniversalSocialauth(axios, {
    providers: {
      google: {
        url: '/api/auth/google',
        clientId: useRuntimeConfig().public.googleClientId as string,
        redirectUri: `${window.location.origin}/auth/callback`
      }
    }
  });
  return { provide: { socialAuth: auth } };
});
```

## Calling it from a page

Call `authenticate` only from a click handler. Never call it during `setup` or
on the server.

```vue
<script setup lang="ts">
const { $socialAuth } = useNuxtApp();
const status = ref('');

async function signIn() {
  const result = await $socialAuth.authenticate('google', { pkce: true, oidc: true } as never);
  if (result instanceof Error) {
    status.value = `Sign-in failed: ${result.message}`;
    return;
  }
  // Send result.code, result.state, result.codeVerifier, result.nonce to your server.
}
</script>

<template>
  <button type="button" @click="signIn">Sign in with Google</button>
  <output aria-live="polite">{{ status }}</output>
</template>
```

## Server

Exchange the code on a Nuxt server route (`server/api/auth/google.post.ts`) or
any backend in [backend recipes](../recipes/express.md). Keep the client secret
out of `runtimeConfig.public`.
