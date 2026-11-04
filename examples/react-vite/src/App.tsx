import { useMemo, useState } from 'react';
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

export function App() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  // Create the client once per mount, not per render.
  const auth = useMemo(
    () =>
      new UniversalSocialauth(axios, {
        providers: {
          google: {
            url: BACKEND_EXCHANGE_URL,
            clientId: CLIENT_ID,
            redirectUri: `${window.location.origin}${window.location.pathname}`
          }
        }
      }),
    []
  );

  async function signIn(): Promise<void> {
    setBusy(true);
    setStatus('Opening Google sign-in…');

    // ProderT's index signature rejects boolean flags, so widen the literal through the parameter type.
    const provider = { ...Google, pkce: true, oidc: true } as unknown as Parameters<typeof auth.authenticate>[1];
    const result = (await auth.authenticate('google', provider)) as SignInResult | Error;

    setBusy(false);

    if (result instanceof Error) {
      setStatus(`Sign-in failed: ${result.message}. Choose the button to try again.`);
      return;
    }

    setStatus('Verifying your sign-in with the server…');
    await axios.post(BACKEND_EXCHANGE_URL, {
      code: result.code,
      state: result.state,
      codeVerifier: result.codeVerifier,
      nonce: result.nonce
    });
    setStatus('Signed in.');
  }

  return (
    <main>
      <h1>Sign in</h1>
      <p>
        Signing in opens the provider in a popup. Your backend must exchange the
        returned code (see docs/recipes/express.md).
      </p>
      <button type="button" disabled={busy} aria-busy={busy} onClick={signIn}>
        Sign in with Google
      </button>
      <output aria-live="polite">{status}</output>
    </main>
  );
}
