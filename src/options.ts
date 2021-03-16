/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Default configuration
 */

import { AxiosInstance } from 'axios'

export default {
  baseUrl: null,
  tokenName: 'token',
  tokenPrefix: 'vueauth',
  tokenHeader: 'Authorization',
  tokenType: 'Bearer',
  loginUrl: '/auth/login',
  registerUrl: '/auth/register',
  logoutUrl: null,
  storageType: 'localStorage',
  storageNamespace: 'vue3-social-auth',
  cookieStorage: {
    domain: window.location.hostname,
    path: '/',
    secure: false
  },
  requestDataKey: 'data',
  responseDataKey: 'data',

  /**
   * Default request interceptor for Axios library
   * @context {VueSocialauth}
   */
  bindRequestInterceptor: function ($auth: { options: { tokenHeader: string }; $http: AxiosInstance }) {
    console.log('$auth', $auth)
    const tokenHeader = $auth.options.tokenHeader

    $auth.$http.interceptors.request.use((config) => {
      console.log('bindRequestInterceptor', config)

      delete config.headers[tokenHeader]
      return config
    })
  },

  /**
   * Default response interceptor for Axios library
   * @contect {VueSocialauth}
   */
  bindResponseInterceptor: function ($auth: { $http: AxiosInstance }) {
    $auth.$http.interceptors.response.use((response) => {
      console.log('bindResponseInterceptor', response)
      return response
    })
  },

  provider: {}
}
