/**
 * Default configuration
 */
import { AxiosInstance } from 'axios';
declare const _default: {
    baseUrl: null;
    tokenName: string;
    tokenPrefix: string;
    tokenHeader: string;
    tokenType: string;
    loginUrl: string;
    registerUrl: string;
    logoutUrl: null;
    storageType: string;
    storageNamespace: string;
    cookieStorage: {
        domain: string;
        path: string;
        secure: boolean;
    };
    requestDataKey: string;
    responseDataKey: string;
    /**
     * Default request interceptor for Axios library
     * @context {UniversalSocialauth}
     */
    bindRequestInterceptor: ($auth: {
        options: {
            tokenHeader: string;
        };
        $http: AxiosInstance;
    }) => void;
    /**
     * Default response interceptor for Axios library
     * @contect {UniversalSocialauth}
     */
    bindResponseInterceptor: ($auth: {
        $http: AxiosInstance;
    }) => void;
    provider: {};
};
export default _default;
