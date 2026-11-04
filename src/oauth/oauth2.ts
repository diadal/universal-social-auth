import { webPlatform } from '../platform/web';
import { getPlatform } from '../platform/current';
import type { AuthSession, NativeContext, PlatformAdapter } from '../platform/types';
import { camelCase } from '../utils';
import { AuthError } from '../errors';
import { createCodeChallenge, createCodeVerifier, createRandomString } from '../pkce';
import { discoverOidc } from '../oidc';

import { AxiosInstance, AxiosResponse } from 'axios';

/** Adds `state` to an authorization URL unless the provider config already put it there. */
function withState(url: string, state: string | undefined): string {
  if (!state || /[?&]state=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}state=${encodeURIComponent(state)}`;
}

interface ProviderDefaults {
  name: string | null;
  url: string | null;
  clientId: string | null;
  authorizationEndpoint: string | null;
  redirectUri: string | null;
  scope: string | null;
  scopePrefix: string | null;
  scopeDelimiter: string | null;
  state: string | null;
  requiredUrlParams: string[] | null;
  defaultUrlParams: string[];
  responseType: string;
  responseMode?: string | string[];
  responseParams: {
    code: string;
    clientId: string;
    redirectUri: string;
  };
  oauthType: string;
  popupOptions: Record<string, unknown>;
}

const defaultProviderConfig: ProviderDefaults = {
  name: null,
  url: null,
  clientId: null,
  authorizationEndpoint: null,
  redirectUri: null,
  scope: null,
  scopePrefix: null,
  scopeDelimiter: null,
  state: null,
  requiredUrlParams: null,
  defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
  responseType: 'code',
  responseParams: {
    code: 'code',
    clientId: 'clientId',
    redirectUri: 'redirectUri'
  },
  oauthType: '2.0',
  popupOptions: {}
};

export type Func = () => unknown;
export interface OAuthParams {
  [x: string]: number | string;
  code: string;
  clientId: string | number;
  redirectUri: string;
  state: string;
}

export type RepsO = AxiosResponse & OAuthParams;

export interface ProviderConfig {
  [x: string]:
    | number
    | string
    | Func
    | boolean
    | Record<string, unknown>
    | string[]
    | undefined;
  scopeDelimiter: string;
  scopePrefix: string;
  name: string;
  state: string | Func;
  authorizationEndpoint: string;
  popupOptions: Record<string, unknown>;
  redirectUri: string;
  url: string;
  clientId: string | number;
  responseType: string;
  responseMode?: string | string[];
  skipPooling: boolean;
}

export interface Opt {
  withCredentials: boolean | undefined;
  baseUrl: string;
}

export interface Storage1 {
  setItem: (arg0: string, arg1: unknown) => boolean;
  getItem: (arg0: string) => string;
}

type ProAndDef = ProviderConfig & ProviderDefaults;

export default class OAuth2 {
  storage: Storage1;
  $http: AxiosInstance;
  providerConfig: ProviderConfig;
  options: Opt;
  oauthPopup: AuthSession | undefined;
  transactionState: string | undefined;
  constructor(
    $http: AxiosInstance,
    storage: Storage1,
    providerConfig: ProviderConfig,
    options: Opt
  ) {
    this.$http = $http;
    this.storage = storage;
    this.providerConfig = <ProAndDef>{
      ...defaultProviderConfig,
      ...providerConfig
    };
    this.options = options;
  }

  async init() {
    const platform = getPlatform();
    this.resolveTransactionState();

    const cfg = this.providerConfig;
    const extras: Record<string, string> = {};
    const optionalParams = Array.isArray(cfg.optionalUrlParams)
      ? [...new Set(cfg.optionalUrlParams)]
      : [];

    if (typeof cfg.issuer === 'string' && cfg.issuer) {
      const discovery = await discoverOidc(cfg.issuer, this.$http);
      cfg.authorizationEndpoint = discovery.authorization_endpoint;
    }

    await this.addPkceAndNonce(extras, optionalParams);

    if (optionalParams.length) {
      cfg.optionalUrlParams = optionalParams;
    }

    const timeoutMs =
      typeof cfg.callbackTimeout === 'number' ? cfg.callbackTimeout : undefined;

    const url = [
      cfg.authorizationEndpoint,
      this._stringifyRequestParams()
    ].join('?');

    if (platform.kind === 'native' && platform.native) {
      return this.initNative(platform, withState(url, this.transactionState), extras, timeoutMs);
    }

    const OauthP = webPlatform.createSession(url, cfg.name, cfg.popupOptions);
    this.oauthPopup = OauthP;
    const response = <Record<string, unknown> | undefined>(
      await OauthP.open(cfg.redirectUri, cfg.skipPooling, timeoutMs)
    );

    if (!response) return undefined;

    this.assertState(response);

    return { ...response, ...extras };
  }

  /** Generates a fresh state unless a per-transaction state factory is configured. */
  private resolveTransactionState(): void {
    const configuredState = this.providerConfig.state;
    if (typeof configuredState === 'function') {
      const state = configuredState();
      if (typeof state !== 'string' || state.length === 0) {
        throw new AuthError('config', 'OAuth state factory must return a non-empty string');
      }
      this.transactionState = state;
      return;
    }

    if (typeof configuredState === 'string' && configuredState.length > 0) {
      throw new AuthError(
        'config',
        'OAuth state must be generated per sign-in attempt; configure state as a function or omit it'
      );
    }

    this.transactionState = createRandomString(32);
  }

  /** Adds the PKCE challenge and OIDC nonce to the request and records them in `extras`. */
  private async addPkceAndNonce(extras: Record<string, string>, optionalParams: string[]) {
    const cfg = this.providerConfig;
    const addOptionalParam = (param: string) => {
      if (!optionalParams.includes(param)) optionalParams.push(param);
    };

    if (cfg.pkce) {
      const verifier = createCodeVerifier();
      cfg.codeChallenge = await createCodeChallenge(verifier);
      cfg.codeChallengeMethod = 'S256';
      extras.codeVerifier = verifier;
      addOptionalParam('code_challenge');
      addOptionalParam('code_challenge_method');
    }

    if (cfg.oidc) {
      const nonce = createRandomString(16);
      cfg.nonce = nonce;
      extras.nonce = nonce;
      addOptionalParam('nonce');
    }
  }

  private assertState(response: Record<string, unknown>): void {
    const expected = this.transactionState;
    if (!expected || response.state !== expected) {
      throw new AuthError('state_mismatch', 'OAuth state mismatch');
    }
  }

  /**
   * Native sign-in. The transaction (PKCE verifier, nonce) is saved under `state`
   * before the browser opens and consumed exactly once when the callback arrives.
   */
  private async initNative(
    platform: PlatformAdapter,
    url: string,
    extras: Record<string, string>,
    timeoutMs: number | undefined
  ): Promise<Record<string, unknown> | undefined> {
    const cfg = this.providerConfig;
    const native = <NativeContext>platform.native;
    const state = <string>this.transactionState;

    await native.transactions.save(state, {
      provider: cfg.name,
      codeVerifier: extras.codeVerifier,
      nonce: extras.nonce
    });

    const session = platform.createSession(url, cfg.name, cfg.popupOptions);
    this.oauthPopup = session;

    let response: Record<string, unknown> | undefined;
    try {
      response = <Record<string, unknown> | undefined>(
        await session.open(
          cfg.redirectUri,
          cfg.skipPooling,
          timeoutMs,
          state,
          cfg.responseMode
        )
      );
    } catch (error) {
      await native.transactions.discard(state);
      throw error;
    }

    // skipPooling: the callback arrives later, and resumePendingSignIn completes it.
    if (!response) return undefined;

    const pending = await native.transactions.consume(state);
    if (pending?.provider !== cfg.name || !pending) {
      throw new AuthError('state_mismatch', 'OAuth state mismatch');
    }

    return {
      ...response,
      ...(pending.codeVerifier !== undefined && { codeVerifier: pending.codeVerifier }),
      ...(pending.nonce !== undefined && { nonce: pending.nonce })
    };
  }

  /**
   * Stringify oauth params
   * @author Sahat Yalkabov <https://github.com/sahat>
   * @copyright Method taken from https://github.com/sahat/satellizer
   *
   * @return {String}
   */
  _stringifyRequestParams(): string {
    const keyValuePairs: unknown[][] = [];
    let includesState = false;
    const paramCategories = [
      'defaultUrlParams',
      'requiredUrlParams',
      'optionalUrlParams'
    ];

    paramCategories.forEach(categoryName => {
      if (!this.providerConfig[categoryName]) return;
      if (!Array.isArray(this.providerConfig[categoryName])) return;
      const Procate = this.providerConfig[categoryName];
      Procate.forEach((paramName: string) => {
        const camelCaseParamName = camelCase(paramName);
        const Proconf = <() => void>(<unknown>this.providerConfig[paramName]);

        let paramValue: unknown;
        if (paramName === 'state') {
          includesState = true;
          paramValue = encodeURIComponent(this.transactionState ?? '');
        } else {
          paramValue =
            typeof Proconf === 'function'
              ? Proconf()
              : this.providerConfig[camelCaseParamName];
        }
        if (paramName === 'redirect_uri' && !paramValue) return;

        if (paramName === 'scope' && Array.isArray(paramValue)) {
          paramValue = paramValue.join(this.providerConfig.scopeDelimiter);
          if (this.providerConfig.scopePrefix) {
            paramValue = [this.providerConfig.scopePrefix, paramValue].join(
              this.providerConfig.scopeDelimiter
            );
          }
        }

        keyValuePairs.push([paramName, paramValue]);
      });
    });

    if (!includesState) {
      keyValuePairs.push(['state', encodeURIComponent(this.transactionState ?? '')]);
    }

    return keyValuePairs
      .map(param => {
        return param.join('=');
      })
      .join('&');
  }
}
