import type { AxiosInstance } from 'axios';
import OAuth2, { ProviderConfig } from '../oauth/oauth2';
import OAuth1, { ProviderConfig1, Opt1 } from '../oauth/oauth1';
import { createNativePlatform } from '../platform/native';
import { setPlatform, getPlatform } from '../platform/current';
import { webPlatform } from '../platform/web';
import { TransactionStore, memoryKeyValueStore } from '../platform/transaction-store';
import { resumePendingSignIn } from '../platform/resume';
import type { NativeBridge, NativeContext } from '../platform/types';

const REDIRECT = 'myapp://cb';
type OpenUrlMock = jest.MockedFunction<NativeBridge['openUrl']>;
type OAuthHttpMock = jest.MockedFunction<
  (request: Record<string, unknown>) => Promise<{ data: Record<string, unknown> }>
>;

function fakeBridge() {
  let listener: ((url: string) => void) | undefined;
  const openUrl: OpenUrlMock = jest.fn((url: string) =>
    Promise.resolve(url).then(() => undefined)
  );
  const bridge: NativeBridge = {
    openUrl,
    closeBrowser: jest.fn(() => Promise.resolve()),
    onUrlOpen: jest.fn(next => {
      listener = next;
      return () => {
        listener = undefined;
      };
    }),
    getLaunchUrl: jest.fn(() => Promise.resolve(undefined))
  };
  return { bridge, openUrl, emit: (url: string) => listener?.(url) };
}

async function nextAuthUrl(openUrl: OpenUrlMock, callIndex = 0): Promise<string> {
  for (let i = 0; i < 50 && openUrl.mock.calls.length <= callIndex; i++) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  return openUrl.mock.calls[callIndex]?.[0] ?? '';
}

function stateFrom(url: string): string {
  return new URL(url).searchParams.get('state') ?? '';
}

function oauth2Config(overrides: Record<string, unknown> = {}): ProviderConfig {
  return {
    name: 'github',
    authorizationEndpoint: 'https://idp.example/authorize',
    redirectUri: REDIRECT,
    clientId: 'client-1',
    responseType: 'code',
    skipPooling: false,
    popupOptions: {},
    ...overrides
  } as unknown as ProviderConfig;
}

const http = <AxiosInstance>(<unknown>jest.fn());
const storage = { setItem: jest.fn(), getItem: jest.fn() };
const opts = { withCredentials: undefined, baseUrl: '' };

describe('native OAuth 2.0', () => {
  let ctx: ReturnType<typeof fakeBridge> & { native: NativeContext };

  beforeAll(() => {
    const { webcrypto } = jest.requireActual<{ webcrypto: unknown }>('crypto');
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
  });

  beforeEach(() => {
    const bridge = fakeBridge();
    const native: NativeContext = {
      bridge: bridge.bridge,
      transactions: new TransactionStore(memoryKeyValueStore()),
      development: false
    };
    ctx = { ...bridge, native };
    setPlatform(createNativePlatform('ios', native));
  });

  afterEach(() => {
    setPlatform(webPlatform);
  });

  it('completes a sign-in and consumes the transaction', async () => {
    const pending = new OAuth2(http, storage, oauth2Config(), opts).init();
    const state = stateFrom(await nextAuthUrl(ctx.openUrl));
    expect(state).not.toBe('');

    ctx.emit(`${REDIRECT}?code=abc&state=${state}`);

    await expect(pending).resolves.toMatchObject({ code: 'abc', state });
    await expect(
      resumePendingSignIn(`${REDIRECT}?code=abc&state=${state}`, ctx.native, REDIRECT)
    ).rejects.toMatchObject({ kind: 'state_mismatch' });
  });

  it('routes concurrent callbacks to the matching state transaction', async () => {
    const first = new OAuth2(http, storage, oauth2Config(), opts).init();
    const second = new OAuth2(http, storage, oauth2Config(), opts).init();
    const [firstUrl, secondUrl] = await Promise.all([
      nextAuthUrl(ctx.openUrl, 0),
      nextAuthUrl(ctx.openUrl, 1)
    ]);
    const firstState = stateFrom(firstUrl);
    const secondState = stateFrom(secondUrl);
    expect(firstState).not.toBe(secondState);

    let firstSettled = false;
    const firstResult = first.then(result => {
      firstSettled = true;
      return result;
    });

    ctx.emit(`${REDIRECT}?code=second&state=${secondState}`);
    await expect(second).resolves.toMatchObject({ code: 'second', state: secondState });
    expect(firstSettled).toBe(false);

    ctx.emit(`${REDIRECT}?code=first&state=${firstState}`);
    await expect(firstResult).resolves.toMatchObject({ code: 'first', state: firstState });
  });

  it('parses a configured fragment response mode in the native flow', async () => {
    const pending = new OAuth2(
      http,
      storage,
      oauth2Config({ responseMode: 'fragment' }),
      opts
    ).init();
    const state = stateFrom(await nextAuthUrl(ctx.openUrl));

    ctx.emit(`${REDIRECT}#code=fragment-code&state=${state}`);

    await expect(pending).resolves.toMatchObject({
      code: 'fragment-code',
      state
    });
  });

  it('rejects a callback whose state does not match a pending sign-in', async () => {
    const pending = new OAuth2(http, storage, oauth2Config(), opts).init();
    await nextAuthUrl(ctx.openUrl);

    ctx.emit(`${REDIRECT}?code=abc&state=forged`);

    await expect(pending).rejects.toMatchObject({ kind: 'state_mismatch' });
  });

  it('maps access_denied to cancelled and discards the transaction', async () => {
    const pending = new OAuth2(http, storage, oauth2Config(), opts).init();
    const state = stateFrom(await nextAuthUrl(ctx.openUrl));

    ctx.emit(`${REDIRECT}?error=access_denied&state=${state}`);

    await expect(pending).rejects.toMatchObject({ kind: 'cancelled' });
    await expect(
      resumePendingSignIn(`${REDIRECT}?code=abc&state=${state}`, ctx.native, REDIRECT)
    ).rejects.toMatchObject({ kind: 'state_mismatch' });
  });

  it('keeps the transaction for cold-start resume when skipPooling is set', async () => {
    const result = await new OAuth2(http, storage, oauth2Config({ skipPooling: true }), opts).init();
    expect(result).toBeUndefined();
    const state = stateFrom(await nextAuthUrl(ctx.openUrl));

    const resumed = await resumePendingSignIn(
      `${REDIRECT}?code=late&state=${state}`,
      ctx.native,
      REDIRECT
    );

    expect(resumed.provider).toBe('github');
    expect(resumed.params).toMatchObject({ code: 'late', state });
  });

  it('restores the saved PKCE verifier and nonce on resume', async () => {
    await ctx.native.transactions.save('s-1', {
      provider: 'github',
      codeVerifier: 'verifier-1',
      nonce: 'nonce-1'
    });

    const resumed = await resumePendingSignIn(
      `${REDIRECT}?code=late&state=s-1`,
      ctx.native,
      REDIRECT
    );

    expect(resumed.params).toMatchObject({ codeVerifier: 'verifier-1', nonce: 'nonce-1' });
  });

  it('does not resume the same callback twice', async () => {
    await ctx.native.transactions.save('s-2', { provider: 'github' });
    await resumePendingSignIn(`${REDIRECT}?code=1&state=s-2`, ctx.native, REDIRECT);

    await expect(
      resumePendingSignIn(`${REDIRECT}?code=1&state=s-2`, ctx.native, REDIRECT)
    ).rejects.toMatchObject({ kind: 'state_mismatch' });
  });
});

describe('native OAuth 1.0', () => {
  it('keeps the request-token secret out of the browser URL and restores it on callback', async () => {
    const bridge = fakeBridge();
    const native: NativeContext = {
      bridge: bridge.bridge,
      transactions: new TransactionStore(memoryKeyValueStore()),
      development: false
    };
    setPlatform(createNativePlatform('android', native));

    const $http: OAuthHttpMock = jest
      .fn()
      .mockResolvedValueOnce({ data: { oauth_token: 'tok', oauth_token_secret: 'sec' } })
      .mockResolvedValueOnce({ data: { ok: true } });
    const config = {
      name: 'twitter',
      url: 'https://idp.example/request-token',
      authorizationEndpoint: 'https://idp.example/authorize',
      redirectUri: REDIRECT,
      skipPooling: false,
      popupOptions: {}
    } as unknown as ProviderConfig1;
    const options = {
      withCredentials: undefined,
      baseUrl: '',
      requestDataKey: 'data',
      responseDataKey: 'data'
    } as unknown as Opt1;

    try {
      const pending = new OAuth1(
        <AxiosInstance>(<unknown>$http),
        storage,
        config,
        options
      ).init({ userId: 'u-1' });

      const authUrl = await nextAuthUrl(bridge.openUrl);
      expect(authUrl).toContain('oauth_token=tok');
      expect(authUrl).not.toContain('sec');

      bridge.emit(`${REDIRECT}?oauth_token=tok&oauth_verifier=v`);

      await pending;
      expect($http.mock.calls[1][0].data).toMatchObject({
        userId: 'u-1',
        oauth_token: 'tok',
        oauth_verifier: 'v',
        oauth_token_secret: 'sec'
      });
      expect(getPlatform().kind).toBe('native');
    } finally {
      setPlatform(webPlatform);
    }
  });

  it('does not exchange before a skipPooling callback is resumed', async () => {
    const bridge = fakeBridge();
    const native: NativeContext = {
      bridge: bridge.bridge,
      transactions: new TransactionStore(memoryKeyValueStore()),
      development: false
    };
    setPlatform(createNativePlatform('android', native));

    const $http: OAuthHttpMock = jest
      .fn()
      .mockResolvedValueOnce({ data: { oauth_token: 'tok-late', oauth_token_secret: 'sec-late' } })
      .mockResolvedValueOnce({ data: { ok: true } });
    const config = {
      name: 'twitter',
      url: 'https://idp.example/request-token',
      authorizationEndpoint: 'https://idp.example/authorize',
      redirectUri: REDIRECT,
      skipPooling: true,
      popupOptions: {}
    } as unknown as ProviderConfig1;
    const options = {
      withCredentials: undefined,
      baseUrl: '',
      requestDataKey: 'data',
      responseDataKey: 'data'
    } as unknown as Opt1;

    try {
      const oauth = new OAuth1(
        <AxiosInstance>(<unknown>$http),
        storage,
        config,
        options
      );
      await expect(oauth.init({ userId: 'u-2' })).resolves.toBeUndefined();
      await nextAuthUrl(bridge.openUrl);
      expect($http).toHaveBeenCalledTimes(1);

      const resumed = await resumePendingSignIn(
        `${REDIRECT}?oauth_token=tok-late&oauth_verifier=v-late`,
        native,
        REDIRECT
      );
      expect(resumed.params.oauth_token_secret).toBe('sec-late');

      await oauth.exchangeForToken(resumed.params, { userId: 'u-2' });
      expect($http).toHaveBeenCalledTimes(2);
      expect($http.mock.calls[1][0].data).toMatchObject({
        oauth_token: 'tok-late',
        oauth_verifier: 'v-late',
        oauth_token_secret: 'sec-late',
        userId: 'u-2'
      });
    } finally {
      setPlatform(webPlatform);
    }
  });

  it('routes concurrent callbacks to the matching OAuth 1.0 request token', async () => {
    const bridge = fakeBridge();
    const native: NativeContext = {
      bridge: bridge.bridge,
      transactions: new TransactionStore(memoryKeyValueStore()),
      development: false
    };
    setPlatform(createNativePlatform('android', native));

    const $http: OAuthHttpMock = jest
      .fn()
      .mockResolvedValueOnce({ data: { oauth_token: 'tok-1', oauth_token_secret: 'sec-1' } })
      .mockResolvedValueOnce({ data: { oauth_token: 'tok-2', oauth_token_secret: 'sec-2' } })
      .mockResolvedValue({ data: { ok: true } });
    const config = {
      name: 'twitter',
      url: 'https://idp.example/request-token',
      authorizationEndpoint: 'https://idp.example/authorize',
      redirectUri: REDIRECT,
      skipPooling: false,
      popupOptions: {}
    } as unknown as ProviderConfig1;
    const options = {
      withCredentials: undefined,
      baseUrl: '',
      requestDataKey: 'data',
      responseDataKey: 'data'
    } as unknown as Opt1;

    try {
      const makeOAuth = () =>
        new OAuth1(
          <AxiosInstance>(<unknown>$http),
          storage,
          config,
          options
        );
      const first = makeOAuth().init({ userId: 'first' });
      const second = makeOAuth().init({ userId: 'second' });
      const [firstUrl, secondUrl] = await Promise.all([
        nextAuthUrl(bridge.openUrl, 0),
        nextAuthUrl(bridge.openUrl, 1)
      ]);
      const firstToken = new URL(firstUrl).searchParams.get('oauth_token');
      const secondToken = new URL(secondUrl).searchParams.get('oauth_token');
      expect(firstToken).toBe('tok-1');
      expect(secondToken).toBe('tok-2');

      let firstSettled = false;
      const firstResult = first.then(result => {
        firstSettled = true;
        return result;
      });

      bridge.emit(`${REDIRECT}?oauth_token=tok-2&oauth_verifier=v-2`);
      await expect(second).resolves.toMatchObject({ data: { ok: true } });
      expect(firstSettled).toBe(false);

      bridge.emit(`${REDIRECT}?oauth_token=tok-1&oauth_verifier=v-1`);
      await expect(firstResult).resolves.toMatchObject({ data: { ok: true } });
      expect($http.mock.calls[2][0].data).toMatchObject({
        oauth_token: 'tok-2',
        oauth_token_secret: 'sec-2',
        userId: 'second'
      });
      expect($http.mock.calls[3][0].data).toMatchObject({
        oauth_token: 'tok-1',
        oauth_token_secret: 'sec-1',
        userId: 'first'
      });
    } finally {
      setPlatform(webPlatform);
    }
  });
});
