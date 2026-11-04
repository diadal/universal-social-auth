import axios from 'axios';
import UniversalSocialauth, { Google } from 'universal-social-auth';

interface SignInResult {
  code: string;
  state: string;
  codeVerifier: string;
  nonce: string;
}

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const BACKEND_EXCHANGE_URL = '/api/auth/google';

const auth = new UniversalSocialauth(axios, {
  providers: {
    google: {
      url: BACKEND_EXCHANGE_URL,
      clientId: CLIENT_ID,
      redirectUri: `${window.location.origin}${window.location.pathname}`
    }
  }
});

const button = document.getElementById('google-login') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLOutputElement;

function report(message: string): void {
  status.textContent = message;
}

button.addEventListener('click', async () => {
  button.disabled = true;
  report('Opening Google sign-in…');

  // ProderT's index signature rejects boolean flags, so widen the literal through the parameter type.
  const provider = { ...Google, pkce: true, oidc: true } as unknown as Parameters<typeof auth.authenticate>[1];
  const result = (await auth.authenticate('google', provider)) as SignInResult | Error;

  button.disabled = false;

  if (result instanceof Error) {
    report(`Sign-in failed: ${result.message}. Choose the button to try again.`);
    return;
  }

  report('Verifying your sign-in with the server…');
  await axios.post(BACKEND_EXCHANGE_URL, {
    code: result.code,
    state: result.state,
    codeVerifier: result.codeVerifier,
    nonce: result.nonce
  });
  report('Signed in.');
});
