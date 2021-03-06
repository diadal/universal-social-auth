import OAuthPopup from './popup';
import { joinUrl } from '../utils';
import { AxiosInstance, AxiosResponse } from 'axios';

interface Keyc {
  [x: string]: AxiosResponse<Record<string, unknown>>;
}

interface KeyD {
  [x: string]: Record<string, unknown> | string | boolean | undefined;
}
interface def {
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

const defaultProviderConfig: def = {
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

export interface ProviderConfig1 {
  [x: string]:
    | number
    | string
    | Func
    | boolean
    | Record<string, string | undefined>
    | boolean
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
    | boolean
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

// interface IFooBar extends ProviderConfig1, def {}
type ProAndDef = ProviderConfig1 & def;
export default class OAuth {
  storage: Storage;
  $http: AxiosInstance;
  providerConfig: ProAndDef;
  options: Opt1;
  oauthPopup: OAuthPopup | undefined;
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
    this.oauthPopup = new OAuthPopup(
      'about:blank',
      this.providerConfig.name,
      this.providerConfig.popupOptions
    );

    if (window) {
      //
      void this.oauthPopup.open(this.providerConfig.redirectUri, true);
    }

    return this.getRequestToken().then(async response => {
      const popupResponse = this.openPopup(<Keyc>(<unknown>response));
      const token = this.exchangeForToken(
        <Record<string, unknown>>(<unknown>popupResponse),
        userData
      );

      return token;
    });
  }

  async getRequestToken() {
    // const requestOptions:Opt1 = { method: undefined, withCredentials: undefined, url: '', baseUrl: '', requestDataKey: '', responseDataKey: '' }
    const requestOptions: KeyD = <KeyD>{};
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

  openPopup(response: Keyc) {
    const rep = response;

    const rep2 = <KeyD>(<unknown>rep[this.options.responseDataKey]);
    const url: Location = <Location>(
      (<unknown>(
        [
          this.providerConfig.authorizationEndpoint,
          this.buildQueryString(rep2)
        ].join('?')
      ))
    );
    const OauthP = <OAuthPopup>this.oauthPopup;
    const location = <Window>OauthP.popup;
    location.location = url;
    if (window) {
      return OauthP.open(
        this.providerConfig.redirectUri,
        this.providerConfig.skipPooling
      );
    } else {
      return OauthP.pooling(this.providerConfig.redirectUri);
    }
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
    const requestOptions: KeyD = <KeyD>{};
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
