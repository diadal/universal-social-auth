import OAuthPopup from './popup';
import { camelCase, isString } from '../utils';
import { AuthError } from '../errors';
import { createCodeChallenge, createCodeVerifier, createRandomString } from '../pkce';
import { discoverOidc } from '../oidc';

import { AxiosInstance, AxiosResponse } from 'axios';

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
    | string[];
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
  oauthPopup: OAuthPopup | undefined;
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
    const stateName = this.providerConfig.name + '_state';
    const isFunc: Func = <Func>this.providerConfig.state;
    const isStr = <string>this.providerConfig.state;
    if (typeof isFunc === 'function') {
      this.storage.setItem(stateName, isFunc());
    } else if (isString(isStr)) {
      this.storage.setItem(stateName, isStr);
    }

    const cfg = this.providerConfig;
    const extras: Record<string, string> = {};
    const optionalParams = Array.isArray(cfg.optionalUrlParams)
      ? [...cfg.optionalUrlParams]
      : [];

    if (typeof cfg.issuer === 'string' && cfg.issuer) {
      const discovery = await discoverOidc(cfg.issuer, this.$http);
      cfg.authorizationEndpoint = discovery.authorization_endpoint;
    }

    if (cfg.pkce) {
      const verifier = createCodeVerifier();
      this.storage.setItem(cfg.name + '_pkce_verifier', verifier);
      cfg.codeChallenge = await createCodeChallenge(verifier);
      cfg.codeChallengeMethod = 'S256';
      extras.codeVerifier = verifier;
      optionalParams.push('code_challenge', 'code_challenge_method');
    }

    if (cfg.oidc) {
      const nonce = createRandomString(16);
      this.storage.setItem(cfg.name + '_nonce', nonce);
      cfg.nonce = nonce;
      extras.nonce = nonce;
      optionalParams.push('nonce');
    }

    if (optionalParams.length) {
      cfg.optionalUrlParams = optionalParams;
    }

    const url = [
      cfg.authorizationEndpoint,
      this._stringifyRequestParams()
    ].join('?');

    this.oauthPopup = new OAuthPopup(url, cfg.name, cfg.popupOptions);
    const OauthP = this.oauthPopup;
    const timeoutMs =
      typeof cfg.callbackTimeout === 'number' ? cfg.callbackTimeout : undefined;
    const response = <Record<string, unknown> | undefined>(
      await OauthP.open(cfg.redirectUri, cfg.skipPooling, timeoutMs)
    );

    if (!response) return undefined;

    if (cfg.state) {
      const expected = this.storage.getItem(cfg.name + '_state');
      if (!expected || response.state !== expected) {
        throw new AuthError('state_mismatch', 'OAuth state mismatch');
      }
    }

    return { ...response, ...extras };
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
    const paramCategories = [
      'defaultUrlParams',
      'requiredUrlParams',
      'optionalUrlParams'
    ];

    paramCategories.forEach(categoryName => {
      if (!this.providerConfig[categoryName]) return;
      if (!Array.isArray(this.providerConfig[categoryName])) return;
      const Procate = this.providerConfig[categoryName] as string[];
      Procate.forEach((paramName: string) => {
        const camelCaseParamName = camelCase(paramName);
        const Proconf = <() => void>(<unknown>this.providerConfig[paramName]);

        let paramValue =
          typeof Proconf === 'function'
            ? Proconf()
            : this.providerConfig[camelCaseParamName];
        if (paramName === 'redirect_uri' && !paramValue) return;

        if (paramName === 'state') {
          const stateName = this.providerConfig.name + '_state';
          paramValue = encodeURIComponent(this.storage.getItem(stateName));
        }
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

    return keyValuePairs
      .map(param => {
        return param.join('=');
      })
      .join('&');
  }
}
