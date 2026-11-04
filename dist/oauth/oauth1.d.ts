import type { AuthSession } from '../platform/types';
import { AxiosInstance, AxiosResponse } from 'axios';
interface Keyc {
    [x: string]: AxiosResponse<Record<string, unknown>>;
}
interface KeyD {
    [x: string]: Record<string, unknown> | string | boolean | undefined;
}
interface ProviderDefaults {
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
export type Func = () => unknown;
export interface OAuthParams {
    [x: string]: number | string;
    code: string;
    clientId: string | number;
    redirectUri: string;
    state: string;
}
export interface ProviderConfig1 {
    [x: string]: number | string | Func | boolean | Record<string, string | undefined> | undefined;
    name: string;
    popupOptions: Record<string, string | undefined>;
    redirectUri: string;
    url: string;
    skipPooling: boolean;
}
export interface Opt1 {
    [x: string]: string | number | boolean | Func | Record<string, string | undefined> | undefined;
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
type ProAndDef = ProviderConfig1 & ProviderDefaults;
export default class OAuth {
    storage: Storage;
    $http: AxiosInstance;
    providerConfig: ProAndDef;
    options: Opt1;
    oauthPopup: AuthSession | undefined;
    constructor($http: AxiosInstance, storage: Storage, providerConfig: ProviderConfig1, options: Opt1);
    init(userData: Record<string, string | undefined>): Promise<AxiosResponse<any, any, {}, any> | undefined>;
    getRequestToken(): Promise<AxiosResponse<any, any, {}, any>>;
    openPopup(response: Keyc): Promise<unknown>;
    private openNative;
    exchangeForToken(oauth: Record<string, unknown>, userData: Record<string, unknown>): Promise<AxiosResponse<any, any, {}, any>>;
    buildQueryString(params: KeyD): string;
}
export {};
