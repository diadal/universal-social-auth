<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import UniversalSocialauth, { Google } from 'universal-social-auth';

// Client ID is public. The client secret and token exchange stay on the backend.
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const BACKEND_EXCHANGE_URL = '/api/auth/google';

interface SignInResult {
  code: string;
  state: string;
  codeVerifier: string;
  nonce: string;
}

const busy = ref(false);
const status = ref('');

const auth = new UniversalSocialauth(axios, {
  providers: {
    google: {
      url: BACKEND_EXCHANGE_URL,
      clientId: CLIENT_ID,
      redirectUri: `${window.location.origin}${window.location.pathname}`
    }
  }
});

async function signIn(): Promise<void> {
  busy.value = true;
  status.value = 'Opening Google sign-in…';

  // ProderT's index signature rejects boolean flags, so widen the literal through the parameter type.
  const provider = { ...Google, pkce: true, oidc: true } as unknown as Parameters<typeof auth.authenticate>[1];
  const result = (await auth.authenticate('google', provider)) as SignInResult | Error;

  busy.value = false;

  if (result instanceof Error) {
    status.value = `Sign-in failed: ${result.message}. Choose the button to try again.`;
    return;
  }

  status.value = 'Verifying your sign-in with the server…';
  await axios.post(BACKEND_EXCHANGE_URL, {
    code: result.code,
    state: result.state,
    codeVerifier: result.codeVerifier,
    nonce: result.nonce
  });
  status.value = 'Signed in.';
}
</script>

<template>
  <main>
    <h1>Sign in</h1>
    <p>
      Signing in opens the provider in a popup. Your backend must exchange the
      returned code (see docs/recipes/express.md).
    </p>
    <button type="button" :disabled="busy" :aria-busy="busy" @click="signIn">
      Sign in with Google
    </button>
    <output aria-live="polite">{{ status }}</output>
  </main>
</template>
