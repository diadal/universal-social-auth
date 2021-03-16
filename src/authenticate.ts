/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosInstance } from 'axios'
import { ProderT } from './providers'

import { OptionsA } from './utils'
import defaultOptions from './options'
import StorageFactory from './storage'
import OAuth1, { Opt1, ProviderConfig1 } from './oauth/oauth1'
import OAuth2, { Opt, ProviderConfig, Storage1 } from './oauth/oauth2'

// export interface ProderT {
//   [x: string]: Record<string, any> | string | boolean | undefined ;
// }

interface KeyB {
  [x: string]: Record<string, unknown>;
}

interface Req {
    $http: AxiosInstance,
    storage: Storage,
    providerConfig: ProviderConfig,
    options: Opt
}

export default class UniversalSocialauth {
  options: Opt | undefined;
  storage: Storage1 | undefined;
  $http: AxiosInstance | undefined;
  OverrideOptions: any;
  defaultOptions: any;
  constructor (
    $http: AxiosInstance,
    overrideOptions: Record<string, unknown>
  ) {
    // const options = (provider:string | number) => {
    //   let opts = objectExtend({}, defaultOptions)
    //   opts = objectExtend(options, overrideOptions)
    //   const storage = StorageFactory(opts)
    //   console.log('optsopts', opts)

    //   return { opts: opts, storage: storage }
    // }
    $http.interceptors.response.use((response) => {
      const data: Response = <Response>response.data
      console.log('datadata', data)
      return response
    })
    Object.defineProperties(this, {
      $http: {
        get () {
          return $http
        }
      },

      OverrideOptions: {
        get () {
          return overrideOptions
        }
      },
      defaultOptions: {
        get () {
          return defaultOptions
        }
      }

      // storage: {
      //   get () {
      //     return storage
      //   }
      // },

      // tokenName: {
      //   get () {
      //     if (this.options.tokenPrefix) {
      //       return [this.options.tokenPrefix, this.options.tokenName].join('_')
      //     } else {
      //       return this.options.tokenName
      //     }
      //   }
      // }
    })
  }

  // /**
  //  * Get token if user is authenticated
  //  * @return {String} Authentication token
  //  */
  // getToken (tokenName:string): string {
  //   return this.storage.getItem(tokenName)
  // }

  // tokenName (tokenName: string) {
  //   throw new Error('Method not implemented. ' + tokenName)
  // }

  async authenticate (
    provider: string,
    ProData: ProderT,
    userData = {}
  ) {
    const ProviderOver:{providers:string[]} = <{providers:string[]}> this.OverrideOptions
    const ProviderOverr:KeyB = <KeyB><unknown>ProviderOver.providers
    const ProviderOverride:ProderT = <ProderT>ProviderOverr[provider]
    // const ProviderOpt:string[] = <string[]>ProData
    // console.log('ProviderOpt', ProviderOpt)

    const Opts = {
      provider: {
        ...ProData,
        ...ProviderOverride
      }
    }
    const FinalOpts:string[] = <string[]> {
      ...this.defaultOptions,
      ...Opts
    }
    this.options = <Opt><unknown>FinalOpts

    // console.log('FinalOpts', FinalOpts)
    this.storage = <Storage1> <unknown>StorageFactory(<{ storageType: any; storageNamespace: null; cookieStorage: OptionsA} ><unknown>FinalOpts)

    const proconfg:{provider: string[]; bindRequestInterceptor:(agr0:Req)=>void; bindResponseInterceptor:(arg0:Req)=>void} = <{provider: string[];bindRequestInterceptor:()=>void; bindResponseInterceptor:()=>void}> <unknown>FinalOpts
    const providerConfig:string[] = proconfg.provider
    const proConfig:{oauthType:string} = <{oauthType:string}><unknown>providerConfig
    if (
      proconfg.bindRequestInterceptor &&
      typeof proconfg.bindRequestInterceptor === 'function' &&
      proconfg.bindResponseInterceptor &&
      typeof proconfg.bindResponseInterceptor === 'function'
    ) {
      // console.log('this', this)
      const data:Req = <Req><unknown>{ options: this.options, storage: this.storage, $http: this.$http, providerConfig: providerConfig }
      // console.log('data', data)

      // proconfg.bindRequestInterceptor.call(this)
      proconfg.bindRequestInterceptor.call(this, data)

      proconfg.bindResponseInterceptor.call(this, data)
      // proconfg.bindResponseInterceptor.call(data)
    } else {
      throw new Error(
        'Both request and response interceptors must be functions'
      )
    }
    if (!providerConfig) {
      return new Error('Unknown provider')
    }
    try {
      let providerInstance
      switch (proConfig.oauthType) {
        case '1.0':
          console.log('providerConfig', providerConfig)

          providerInstance = new OAuth1(
            (<AxiosInstance> this.$http),
            (this.storage),
            (<ProviderConfig1><unknown>providerConfig),
            (<Opt1><unknown>FinalOpts)
          )
          break
        case '2.0':
          providerInstance = new OAuth2(
            (<AxiosInstance> this.$http),
            (this.storage),
            (<ProviderConfig><unknown>providerConfig),
            (<Opt><unknown>FinalOpts)
          )
          break
        default:
          return new Error('Invalid OAuth type')
      }
      // console.log('providerInstance', providerInstance)
      return providerInstance
        .init(userData)
        .then(response => {
          return response
        })
        .catch(err => new Error(err))
    } catch (error) {
      const err:string[] = <string[]> error
      return err
    }
  }
}
