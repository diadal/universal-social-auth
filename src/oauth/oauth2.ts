/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import OAuthPopup from './popup'
import {
  camelCase,
  // isFunction,
  isString,
  joinUrl
  // objectExtend
} from '../utils'

import { AxiosInstance, AxiosResponse } from 'axios'

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
    requiredUrlParams: string | null;
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

const defaultProviderConfig:def = {
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
}

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

export type RepsO = AxiosResponse & oAuth
// interface Scp {
//   (scopeDelimiter: string): string;
// }

export interface ProviderConfig {
  [x: string]: number | string | Func | boolean | Record<string, any>;
  scopeDelimiter: string;
  scopePrefix: string;
  name: string;
  state: string | Func;
  authorizationEndpoint: string;
  popupOptions: Record<string, any>;
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
  constructor (
    $http: AxiosInstance,
    storage: Storage1,
    providerConfig: ProviderConfig,
    options: Opt
  ) {
    this.$http = $http
    this.storage = storage
    this.providerConfig = <ProAndDef> {
      ...defaultProviderConfig,
      ...providerConfig
    }

    this.options = options
  }

  async init (userData: Record<string, string| undefined>) {
    const stateName = this.providerConfig.name + '_state'
    const isFunc: Func = <Func> this.providerConfig.state
    const isStr = <string> this.providerConfig.state
    if (typeof isFunc === 'function') {
      this.storage.setItem(stateName, isFunc())
    } else if (isString(isStr)) {
      this.storage.setItem(stateName, isStr)
    }

    const url = [
      this.providerConfig.authorizationEndpoint,
      this._stringifyRequestParams()
    ].join('?')

    // console.log('url', url)

    this.oauthPopup = new OAuthPopup(
      url,
      this.providerConfig.name,
      this.providerConfig.popupOptions
    )
    const OauthP = this.oauthPopup

    try {
      const response = OauthP.open(
        this.providerConfig.redirectUri,
        this.providerConfig.skipPooling
      )
      if (response) {
        const rsp = <any>response

        if (
          this.providerConfig.responseType === 'code' ||
            !this.providerConfig.url
        ) {
          return response
        }

        if (rsp.state && rsp.state !== this.storage.getItem(stateName)) {
          return (
            new Error(
              'State parameter value does not match original OAuth request state value'
            )
          )
        }
        const token = await this.exchangeForToken(rsp, userData)
        console.log('token2', token)

        return token
      }
      console.log('Oauth', response)
    } catch (error) {
      // console.log('error11', error)
      return new Error(error)
    }
    // return new Promise((resolve, reject) => {
    //   OauthP.open(
    //     this.providerConfig.redirectUri,
    //     this.providerConfig.skipPooling
    //   )
    //     .then((response) => {
    //       console.log('response', response)
    //       const rsp = <RepsO>response
    //       if (
    //         this.providerConfig.responseType === 'code' ||
    //         !this.providerConfig.url
    //       ) {
    //         return resolve(response)
    //       }

    //       if (rsp.state && rsp.state !== this.storage.getItem(stateName)) {
    //         return reject(
    //           new Error(
    //             'State parameter value does not match original OAuth request state value'
    //           )
    //         )
    //       }
    //       const token = this.exchangeForToken(rsp, userData)
    //       console.log('token2', token)

    //       resolve(token)
    //     })
    //     .catch((err: any) => {
    //       reject(err)
    //     })
    // })
  }

  async exchangeForToken (oauth: RepsO, userData: Record<string, any>) {
    const payload = {
      ...userData
    }

    for (const key in defaultProviderConfig.responseParams) {
      // const value = defaultProviderConfig[key]

      switch (key) {
        case 'code':
          payload[key] = oauth.code
          break
        case 'clientId':
          payload[key] = this.providerConfig.clientId
          break
        case 'redirectUri':
          payload[key] = this.providerConfig.redirectUri
          break
        default:
          payload[key] = oauth[key]
      }
    }

    if (oauth.state) {
      payload.state = oauth.state
    }

    let exchangeTokenUrl
    if (this.options.baseUrl) {
      exchangeTokenUrl = joinUrl(this.options.baseUrl, this.providerConfig.url)
    } else {
      exchangeTokenUrl = this.providerConfig.url
    }
    const post = await this.$http.post(exchangeTokenUrl, payload, {
      withCredentials: this.options.withCredentials
    })
    console.log('post', post)

    return post
  }

  /**
   * Stringify oauth params
   * @author Sahat Yalkabov <https://github.com/sahat>
   * @copyright Method taken from https://github.com/sahat/satellizer
   *
   * @return {String}
   */
  _stringifyRequestParams (): string {
    const keyValuePairs: any[][] = []
    const paramCategories = [
      'defaultUrlParams',
      'requiredUrlParams',
      'optionalUrlParams'
    ]

    paramCategories.forEach(categoryName => {
      if (!this.providerConfig[categoryName]) return
      if (!Array.isArray(this.providerConfig[categoryName])) return
      const Procate = <Record<string, any>>(<unknown> this.providerConfig[categoryName])
      Procate.forEach((paramName: string) => {
        const camelCaseParamName = camelCase(paramName)
        const Proconf = <() => void>(<unknown> this.providerConfig[paramName])

        let paramValue = typeof Proconf === 'function'
          ? Proconf()
          : this.providerConfig[camelCaseParamName]

        if (paramName === 'redirect_uri' && !paramValue) return

        if (paramName === 'state') {
          const stateName = this.providerConfig.name + '_state'
          paramValue = encodeURIComponent(this.storage.getItem(stateName))
        }
        if (paramName === 'scope' && Array.isArray(paramValue)) {
          paramValue = paramValue.join(this.providerConfig.scopeDelimiter)
          if (this.providerConfig.scopePrefix) {
            paramValue = [this.providerConfig.scopePrefix, paramValue].join(
              this.providerConfig.scopeDelimiter
            )
          }
        }

        keyValuePairs.push([paramName, paramValue])
      })
    })

    return keyValuePairs
      .map(param => {
        return param.join('=')
      })
      .join('&')
  }
}
