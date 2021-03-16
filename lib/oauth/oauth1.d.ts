import OAuthPopup from './popup';
import { AxiosInstance, AxiosResponse } from 'axios';
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
    [x: string]: number | string | Func | boolean | Record<string, string | undefined> | boolean | undefined;
    name: string;
    popupOptions: Record<string, string | undefined>;
    redirectUri: string;
    url: string;
    skipPooling: boolean;
}
export interface Opt1 {
    [x: string]: string | number | boolean | Func | Record<string, string | undefined> | boolean | undefined;
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
declare type ProAndDef = ProviderConfig1 & def;
export default class OAuth {
    storage: Storage;
    $http: AxiosInstance;
    providerConfig: ProAndDef;
    options: Opt1;
    oauthPopup: OAuthPopup | undefined;
    constructor($http: AxiosInstance, storage: Storage, providerConfig: ProviderConfig1, options: Opt1);
    init(userData: Record<string, string | undefined>): Promise<AxiosResponse<any>>;
    getRequestToken(): Promise<AxiosResponse<any>>;
    openPopup(response: AxiosResponse<any>): Promise<unknown>;
    exchangeForToken(oauth: any, userData: Record<string, any>): import("axios").AxiosPromise<any>;
    buildQueryString(params: any): string;
}
export {};
