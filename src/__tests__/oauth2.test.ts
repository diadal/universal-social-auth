/**
 * @jest-environment node
 */
import { AxiosInstance } from 'axios';
import OAuth2, { ProviderConfig, Storage1 } from '../oauth/oauth2';
import OAuthPopup from '../oauth/popup';
import { createCodeChallenge } from '../pkce';

function memoryStorage(): Storage1 {
  const data = new Map<string, unknown>();
  return {
    setItem: (key: string, value: unknown) => {
      data.set(key, value);
      return true;
    },
    getItem: (key: string) => data.get(key) as string
  };
}

function config(extra: Record<string, unknown> = {}): ProviderConfig {
  return {
    name: 'demo',
    url: '',
    clientId: 'cid',
    authorizationEndpoint: 'https://auth.example.com/authorize',
    redirectUri: 'https://app.example.com/cb',
    scope: ['read'],
    scopeDelimiter: ' ',
    scopePrefix: '',
    state: () => 'expected',
    requiredUrlParams: ['state'],
    optionalUrlParams: [],
    responseType: 'code',
    popupOptions: {},
    skipPooling: false,
    ...extra
  };
}

const options = { withCredentials: undefined, baseUrl: '' };

function lastPopupUrl(spy: jest.SpyInstance): string {
  const instance = spy.mock.contexts[spy.mock.contexts.length - 1] as OAuthPopup;
  return instance.url;
}

function callbackWithRequestState(this: OAuthPopup) {
  const state = new URL(this.url).searchParams.get('state');
  return Promise.resolve({ code: 'abc', ...(state && { state }) });
}

describe('OAuth2 init', () => {
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    openSpy = jest
      .spyOn(OAuthPopup.prototype, 'open')
      .mockResolvedValue({ code: 'abc', state: 'expected' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects a callback whose state does not match', async () => {
    openSpy.mockResolvedValue({ code: 'abc', state: 'attacker' });
    const oauth = new OAuth2({} as AxiosInstance, memoryStorage(), config(), options);
    await expect(oauth.init()).rejects.toMatchObject({ kind: 'state_mismatch' });
  });

  it('returns the callback params when state matches', async () => {
    const oauth = new OAuth2({} as AxiosInstance, memoryStorage(), config(), options);
    expect(await oauth.init()).toEqual({ code: 'abc', state: 'expected' });
  });

  it('generates and validates fresh state when none is configured', async () => {
    openSpy.mockImplementation(callbackWithRequestState);
    const oauth = new OAuth2(
      {} as AxiosInstance,
      memoryStorage(),
      config({ state: undefined, requiredUrlParams: [] }),
      options
    );

    const first = await oauth.init();
    const second = await oauth.init();

    const firstState = first?.state;
    const secondState = second?.state;
    if (typeof firstState !== 'string' || typeof secondState !== 'string') {
      throw new Error('Generated state was not returned');
    }

    expect(firstState).toBeTruthy();
    expect(firstState).not.toBe(secondState);
    expect(lastPopupUrl(openSpy)).toContain(`state=${secondState}`);
  });

  it('rejects a callback with no state when state was generated', async () => {
    openSpy.mockResolvedValue({ code: 'abc' });
    const oauth = new OAuth2(
      {} as AxiosInstance,
      memoryStorage(),
      config({ state: undefined }),
      options
    );

    await expect(oauth.init()).rejects.toMatchObject({ kind: 'state_mismatch' });
  });

  it('rejects a configured static state value', async () => {
    const oauth = new OAuth2(
      {} as AxiosInstance,
      memoryStorage(),
      config({ state: 'STATE' }),
      options
    );

    await expect(oauth.init()).rejects.toMatchObject({ kind: 'config' });
  });

  it('calls a configured state factory once per transaction', async () => {
    const stateFactory = jest.fn(() => 'fresh-state');
    openSpy.mockImplementation(callbackWithRequestState);
    const oauth = new OAuth2(
      {} as AxiosInstance,
      memoryStorage(),
      config({ state: stateFactory }),
      options
    );

    await oauth.init();

    expect(stateFactory).toHaveBeenCalledTimes(1);
    expect(lastPopupUrl(openSpy)).toContain('state=fresh-state');
  });

  it('adds a PKCE challenge to the URL and returns the verifier', async () => {
    const storage = memoryStorage();
    const oauth = new OAuth2(
      {} as AxiosInstance,
      storage,
      config({ pkce: true }),
      options
    );
    const result = (await oauth.init()) as Record<string, string>;
    const verifier = result.codeVerifier;

    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(storage.getItem('demo_pkce_verifier')).toBeUndefined();
    const challenge = await createCodeChallenge(verifier);
    expect(lastPopupUrl(openSpy)).toContain(`code_challenge=${challenge}`);
    expect(lastPopupUrl(openSpy)).toContain('code_challenge_method=S256');
  });

  it('does not accumulate optional URL params across repeated sign-ins', async () => {
    openSpy.mockImplementation(callbackWithRequestState);
    const oauth = new OAuth2(
      {} as AxiosInstance,
      memoryStorage(),
      config({ pkce: true, oidc: true }),
      options
    );

    await oauth.init();
    await oauth.init();

    const params = new URL(lastPopupUrl(openSpy)).searchParams;
    expect(params.getAll('code_challenge')).toHaveLength(1);
    expect(params.getAll('code_challenge_method')).toHaveLength(1);
    expect(params.getAll('nonce')).toHaveLength(1);
  });

  it('adds a nonce to the URL and returns it when oidc is enabled', async () => {
    const oauth = new OAuth2(
      {} as AxiosInstance,
      memoryStorage(),
      config({ oidc: true }),
      options
    );
    const result = (await oauth.init()) as Record<string, string>;
    expect(result.nonce).toBeTruthy();
    expect(lastPopupUrl(openSpy)).toContain(`nonce=${result.nonce}`);
  });
});
