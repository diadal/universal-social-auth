/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { AxiosInstance, AxiosInterceptorManager } from 'axios';
import { ProderT } from './providers';

import { OptionsA } from './utils';
import defaultOptions from './options';
import StorageFactory from './storage';
import OAuth1, { Opt1, ProviderConfig1 } from './oauth/oauth1';
import OAuth2, { Opt, ProviderConfig, Storage1 } from './oauth/oauth2';
import { AuthError, classifyError } from './errors';
import { emitHook, LifecycleHooks } from './lifecycle';

interface KeyB {
  [x: string]: Record<string, unknown>;
}

interface Req {
  $http: AxiosInstance;
  storage: Storage;
  providerConfig: ProviderConfig;
  options: Opt;
}

interface TrackedIds {
  request: number[];
  response: number[];
}

function trackInterceptors<V>(
  manager: AxiosInterceptorManager<V>,
  ids: number[]
): AxiosInterceptorManager<V> {
  const use = manager.use as (...args: unknown[]) => number;
  return {
    use: (...args: unknown[]) => {
      const id = use.apply(manager, args);
      ids.push(id);
      return id;
    },
    eject: id => manager.eject(id),
    clear: () => manager.clear()
  } as AxiosInterceptorManager<V>;
}

export default class UniversalSocialauth {
  options: Opt | undefined;
  storage: Storage1 | undefined;
  $http: AxiosInstance | undefined;
  OverrideOptions: Record<string, unknown> | undefined;
  defaultOptions: Record<string, unknown> | undefined;
  private interceptorIds: TrackedIds = { request: [], response: [] };
  constructor($http: AxiosInstance, overrideOptions: Record<string, unknown>) {
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

  private ejectInterceptors() {
    const http = this.$http as AxiosInstance;
    this.interceptorIds.request.forEach(id =>
      http.interceptors.request.eject(id)
    );
    this.interceptorIds.response.forEach(id =>
      http.interceptors.response.eject(id)
    );
    this.interceptorIds = { request: [], response: [] };
  }

  async authenticate(provider: string, ProData: ProderT, userData = {}) {
    const ProviderOver: { providers?: Record<string, unknown> } = <
      { providers?: Record<string, unknown> }
      >this.OverrideOptions;
    const ProviderOverr: KeyB = <KeyB>(<unknown>ProviderOver?.providers ?? {});
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
      this.ejectInterceptors();
      const http = this.$http as AxiosInstance;
      const trackedHttp = Object.assign(Object.create(http) as AxiosInstance, {
        interceptors: {
          request: trackInterceptors(
            http.interceptors.request,
            this.interceptorIds.request
          ),
          response: trackInterceptors(
            http.interceptors.response,
            this.interceptorIds.response
          )
        }
      });
      const data: Req = <Req>(<unknown>{
        options: this.options,
        storage: this.storage,
        $http: trackedHttp,
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
      throw new Error('Unknown provider');
    }
    const overrides = this.OverrideOptions ?? {};
    const hooks = overrides.hooks as LifecycleHooks | undefined;
    if (
      providerConfig.callbackTimeout === undefined &&
      typeof overrides.callbackTimeout === 'number'
    ) {
      providerConfig.callbackTimeout = overrides.callbackTimeout;
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
          throw new AuthError('config', 'Invalid OAuth type');
      }
      emitHook(hooks, 'onStart', { provider });
      try {
        const response: unknown = await providerInstance.init(userData);
        emitHook(hooks, 'onComplete', { provider });
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const kind = classifyError(error);
        if (kind === 'cancelled') {
          emitHook(hooks, 'onCancel', { provider });
        } else {
          emitHook(hooks, 'onError', { provider, kind });
        }
        return error;
      }
    } catch (error) {
      const err: Record<string, unknown> = <Record<string, unknown>>error;
      return err;
    }
  }
}

