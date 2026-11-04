import { getPlatform } from '../platform/current';
import type { AuthSession, NativeContext } from '../platform/types';
import { AuthError } from '../errors';
import { joinUrl } from '../utils';
import { AxiosInstance, AxiosResponse } from 'axios';

interface Keyc {
  [x: string]: AxiosResponse<Record<string, unknown>>;
}

interface KeyD {
  [x: string]: Record<string, unknown> | string | boolean | undefined;
}
interface ProviderDefaults {
  name: string | null;
  url: string | null;
  authorizationEndpoint: string | null;
  scope: string | null;
  scopePrefix: string | null;
  scopeDelimiter: string | null;
  redirectUri: string | null;
  requiredUrlParams: string | null;
  defaultUrlParams: string | null;
  oauthType: string;
  popupOptions: string[] | undefined;
}

const defaultProviderConfig: ProviderDefaults = {
  name: null,
  url: null,
  authorizationEndpoint: null,
  scope: null,
  scopePrefix: null,
  scopeDelimiter: null,
  redirectUri: null,
  requiredUrlParams: null,
  defaultUrlParams: null,
  oauthType: '1.0',
  popupOptions: undefined
};

export type Func = () => unknown;
export interface OAuthParams {
  [x: string]: number | string;
  code: string;
  clientId: string | number;
  redirectUri: string;
  state: string;
}

export interface ProviderConfig1 {
  [x: string]:
    | number
    | string
    | Func
    | boolean
    | Record<string, string | undefined>
    | undefined;
  name: string;
  popupOptions: Record<string, string | undefined>;
  redirectUri: string;
  url: string;
  skipPooling: boolean;
}

export interface Opt1 {
  [x: string]:
    | string
    | number
    | boolean
    | Func
    | Record<string, string | undefined>
    | undefined;
  withCredentials: boolean | undefined;
  baseUrl: string;
  requestDataKey: string;
  responseDataKey: string;
  method: string | undefined;
  url: string;
}

interface Storage {
  setItem: (arg0: string, arg1: unknown) => boolean;
  getItem: (arg0: string) => string;
}

// interface KeyD {
//   [x: string]: string[] | string | boolean | undefined;
// }
// interface Meth {
//   [x: string]: string | boolean | undefined;
//   method: string;
//   url: string;
//   withCredentials: boolean | undefined ;
// }

// interface IFooBar extends ProviderConfig1, ProviderDefaults {}
type ProAndDef = ProviderConfig1 & ProviderDefaults;
export default class OAuth {
  storage: Storage;
  $http: AxiosInstance;
  providerConfig: ProAndDef;
  options: Opt1;
  oauthPopup: AuthSession | undefined;
  constructor(
    $http: AxiosInstance,
    storage: Storage,
    providerConfig: ProviderConfig1,
    options: Opt1
  ) {
    this.$http = $http;
    this.storage = storage;
    this.providerConfig = <ProAndDef>{
      ...defaultProviderConfig,
      ...providerConfig
    };

    // this.providerConfig = objectExtend(this.providerConfig, providerConfig)
    this.options = options;
  }

  async init(userData: Record<string, string | undefined>) {
    this.oauthPopup = getPlatform().createSession(
      'about:blank',
      this.providerConfig.name,
      this.providerConfig.popupOptions
    );

    // Open the popup synchronously on the user gesture; the URL is set later in openPopup.
    void this.oauthPopup.open(this.providerConfig.redirectUri, true);

    return this.getRequestToken().then(async response => {
      const popupResponse = await this.openPopup(<Keyc>(<unknown>response));
      if (!popupResponse) return undefined;
      const token = this.exchangeForToken(
        <Record<string, unknown>>(popupResponse),
        userData
      );

      return token;
    });
  }

  async getRequestToken() {
    // const requestOptions:Opt1 = { method: undefined, withCredentials: undefined, url: '', baseUrl: '', requestDataKey: '', responseDataKey: '' }
    const requestOptions: KeyD = {};
    requestOptions.method = 'POST';
    const key: string = this.options.requestDataKey;
    requestOptions[key] = {
      ...this.providerConfig
    };
    requestOptions.withCredentials = this.options.withCredentials;
    if (this.options.baseUrl) {
      requestOptions.url = joinUrl(
        this.options.baseUrl,
        this.providerConfig.url
      );
    } else {
      requestOptions.url = this.providerConfig.url;
    }

    return this.$http(requestOptions);
  }

  async openPopup(response: Keyc) {
    const rep = response;

    const rep2 = <KeyD>(<unknown>rep[this.options.responseDataKey]);
    const native = getPlatform().native;
    if (native) {
      return this.openNative(rep2, native);
    }
    const url: string = [
      this.providerConfig.authorizationEndpoint,
      this.buildQueryString(rep2)
    ].join('?');
    const session = <AuthSession>this.oauthPopup;
    // Navigate the already-open surface. Calling session.open() here would open a
    // second one and wipe the authorization URL.
    if (!(await session.navigate(url))) {
      throw new Error('OAuth popup error occurred');
    }
    if (this.providerConfig.skipPooling) {
      return undefined;
    }
    return session.waitForCallback(this.providerConfig.redirectUri);
  }

  /**
   * Native sign-in. The request-token secret stays in the saved transaction, keyed by
   * `oauth_token`, and is kept out of the browser URL.
   */
  private async openNative(rep2: KeyD, native: NativeContext) {
    const { oauth_token_secret: secret, ...publicParams } = rep2;
    const token = typeof rep2.oauth_token === 'string' ? rep2.oauth_token : '';
    if (!token) {
      throw new AuthError('invalid_token', 'OAuth request token is missing');
    }
    const url: string = [
      this.providerConfig.authorizationEndpoint,
      this.buildQueryString(publicParams)
    ].join('?');

    await native.transactions.save(token, {
      provider: this.providerConfig.name ?? '',
      oauth1RequestTokenSecret: typeof secret === 'string' ? secret : ''
    });

    const session = <AuthSession>this.oauthPopup;
    if (!(await session.navigate(url))) {
      await native.transactions.discard(token);
      throw new Error('OAuth popup error occurred');
    }
    if (this.providerConfig.skipPooling) {
      return undefined;
    }

    let params: Record<string, unknown>;
    try {
      params = <Record<string, unknown>>(
        await session.waitForCallback(
          this.providerConfig.redirectUri,
          undefined,
          undefined,
          token
        )
      );
    } catch (error) {
      await native.transactions.discard(token);
      throw error;
    }

    const pending = await native.transactions.consume(
      typeof params.oauth_token === 'string' ? params.oauth_token : token
    );
    if (!pending) {
      throw new AuthError('state_mismatch', 'OAuth request token mismatch');
    }
    return { ...params, oauth_token_secret: pending.oauth1RequestTokenSecret };
  }


  exchangeForToken(
    oauth: Record<string, unknown>,
    userData: Record<string, unknown>
  ) {
    const payload = {
      ...userData,
      ...oauth
    };
    // payload = objectExtend(payload, oauth)
    const requestOptions: KeyD = {};
    requestOptions.method = 'POST';
    const key = this.options.requestDataKey;
    requestOptions[key] = payload;
    requestOptions.withCredentials = this.options.withCredentials;
    if (this.options.baseUrl) {
      requestOptions.url = joinUrl(
        this.options.baseUrl,
        this.providerConfig.url
      );
    } else {
      requestOptions.url = this.providerConfig.url;
    }
    return this.$http(<Record<string, unknown>>requestOptions);
  }

  buildQueryString(params: KeyD) {
    const parsedParams = [];
    for (const key in params) {
      const value = <string | number | boolean>(<unknown>params[key]);
      parsedParams.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(value)
      );
    }
    return parsedParams.join('&');
  }
}
