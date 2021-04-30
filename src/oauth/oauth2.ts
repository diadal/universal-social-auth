import OAuthPopup from './popup';
import { camelCase, isString } from '../utils';

import { AxiosInstance, AxiosResponse } from 'axios';

interface def {
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

const defaultProviderConfig: def = {
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

export interface Func {
  (): unknown;
}
export interface oAuth {
  [x: string]: number | string;
  code: string;
  clientId: string | number;
  redirectUri: string;
  state: string;
}

export type RepsO = AxiosResponse & oAuth;

export interface ProviderConfig {
  [x: string]: number | string | Func | boolean | Record<string, unknown>;
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

type ProAndDef = ProviderConfig & def;

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

    const url = [
      this.providerConfig.authorizationEndpoint,
      this._stringifyRequestParams()
    ].join('?');

    this.oauthPopup = new OAuthPopup(
      url,
      this.providerConfig.name,
      this.providerConfig.popupOptions
    );
    const OauthP = this.oauthPopup;
    try {
      const response: Record<string, unknown> = <Record<string, unknown>>(
        await OauthP.open(
          this.providerConfig.redirectUri,
          this.providerConfig.skipPooling
        )
      );
      if (response) {
        return response;
      }
    } catch (error) {
      return Promise.reject(error);
    }
    return;
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
      const Procate = <string[]>(<unknown>this.providerConfig[categoryName]);
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
