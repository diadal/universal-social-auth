import OAuthPopup from './popup';
import { AxiosInstance, AxiosResponse } from 'axios';
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
export declare type RepsO = AxiosResponse & oAuth;
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
export default class OAuth2 {
    storage: Storage1;
    $http: AxiosInstance;
    providerConfig: ProviderConfig;
    options: Opt;
    oauthPopup: OAuthPopup | undefined;
    constructor($http: AxiosInstance, storage: Storage1, providerConfig: ProviderConfig, options: Opt);
    init(userData: Record<string, string | undefined>): Promise<unknown>;
    exchangeForToken(oauth: RepsO, userData: Record<string, any>): Promise<AxiosResponse<any>>;
    _stringifyRequestParams(): string;
}
