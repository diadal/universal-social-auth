import { AxiosInstance } from 'axios';
import { ProderT } from './providers';

import { OptionsA } from './utils';
import defaultOptions from './options';
import StorageFactory from './storage';
import OAuth1, { Opt1, ProviderConfig1 } from './oauth/oauth1';
import OAuth2, { Opt, ProviderConfig, Storage1 } from './oauth/oauth2';

interface KeyB {
  [x: string]: Record<string, unknown>;
}

interface Req {
  $http: AxiosInstance;
  storage: Storage;
  providerConfig: ProviderConfig;
  options: Opt;
}

export default class UniversalSocialauth {
  options: Opt | undefined;
  storage: Storage1 | undefined;
  $http: AxiosInstance | undefined;
  OverrideOptions: Record<string, unknown> | undefined;
  defaultOptions: Record<string, unknown> | undefined;
  constructor($http: AxiosInstance, overrideOptions: Record<string, unknown>) {

    $http.interceptors.response.use(response => {
      return response;
    });
    Object.defineProperties(this, {
      $http: {
        get() {
          return $http;
        }
      },

      OverrideOptions: {
        get() {
          return overrideOptions;
        }
      },
      defaultOptions: {
        get() {
          return defaultOptions;
        }
      }
    });
  }

  async authenticate(provider: string, ProData: ProderT, userData = {}) {
    const ProviderOver: { providers: Record<string, unknown> } = <
      { providers: Record<string, unknown> }
      >this.OverrideOptions;
    const ProviderOverr: KeyB = <KeyB>(<unknown>ProviderOver.providers);
    const ProviderOverride: ProderT = <ProderT>ProviderOverr[provider];
    const Opts = {
      provider: {
        ...ProData,
        ...ProviderOverride
      }
    };
    const FinalOpts: Record<string, unknown> = <Record<string, unknown>>{
      ...this.defaultOptions,
      ...Opts
    };

    this.options = <Opt>(<unknown>FinalOpts);
    this.storage = <Storage1>(<unknown>StorageFactory(
      <
      {
        storageType: string;
        storageNamespace: null;
        cookieStorage: OptionsA;
      }
      >FinalOpts
    ));

    const proconfg: {
      provider: Record<string, unknown>;
      bindRequestInterceptor: (agr0: Req) => void;
      bindResponseInterceptor: (arg0: Req) => void;
    } = <
      {
        provider: Record<string, unknown>;
        bindRequestInterceptor: () => void;
        bindResponseInterceptor: () => void;
      }
      >FinalOpts;
    const providerConfig: Record<string, unknown> = proconfg.provider;
    const proConfig: { oauthType: string } = <{ oauthType: string }>(
      providerConfig
    );
    if (
      proconfg.bindRequestInterceptor &&
      typeof proconfg.bindRequestInterceptor === 'function' &&
      proconfg.bindResponseInterceptor &&
      typeof proconfg.bindResponseInterceptor === 'function'
    ) {
      const data: Req = <Req>(<unknown>{
        options: this.options,
        storage: this.storage,
        $http: this.$http,
        providerConfig: providerConfig
      });
      proconfg.bindRequestInterceptor.call(this, data);
      proconfg.bindResponseInterceptor.call(this, data);
    } else {
      throw new Error(
        'Both request and response interceptors must be functions'
      );
    }
    if (!providerConfig) {
      return Promise.reject('Unknown provider');
    }
    try {
      let providerInstance;
      switch (proConfig.oauthType) {
        case '1.0':
          providerInstance = new OAuth1(
            <AxiosInstance>this.$http,
            this.storage,
            <ProviderConfig1>providerConfig,
            <Opt1>FinalOpts
          );
          break;
        case '2.0':
          providerInstance = new OAuth2(
            <AxiosInstance>this.$http,
            this.storage,
            <ProviderConfig>providerConfig,
            <Opt>(<unknown>FinalOpts)
          );
          break;
        default:
          return new Error('Invalid OAuth type');
      }
      return providerInstance
        .init(userData)
        .then(response => {
          return <Record<string, unknown>>response;
        })
        .catch(err => new Error(err));
    } catch (error) {
      const err: Record<string, unknown> = <Record<string, unknown>>error;
      return err;
    }
  }
}
