import { AxiosInstance } from 'axios';

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
   * @context {UniversalSocialauth}
   */
  bindRequestInterceptor: function($auth: {
    options: { tokenHeader: string };
    $http: AxiosInstance;
  }) {
    const tokenHeader: string = $auth.options.tokenHeader;
    $auth.$http.interceptors.request.use(config => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete config.headers[tokenHeader];
      return config;
    });
  },

  /**
   * Default response interceptor for Axios library
   * @contect {UniversalSocialauth}
   */
  bindResponseInterceptor: function($auth: { $http: AxiosInstance }) {
    $auth.$http.interceptors.response.use(response => {
      return response;
    });
  },

  provider: {}
};
