import type { AuthSession } from '../platform/types';
import { AxiosInstance, AxiosResponse } from 'axios';
export type Func = () => unknown;
export interface OAuthParams {
    [x: string]: number | string;
    code: string;
    clientId: string | number;
    redirectUri: string;
    state: string;
}
export type RepsO = AxiosResponse & OAuthParams;
export interface ProviderConfig {
    [x: string]: number | string | Func | boolean | Record<string, unknown> | string[] | undefined;
    scopeDelimiter: string;
    scopePrefix: string;
    name: string;
    state: string | Func;
    authorizationEndpoint: string;
    popupOptions: Record<string, unknown>;
    redirectUri: string;
    url: string;
    clientId: string | number;
    responseType: string;
    responseMode?: string | string[];
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
    oauthPopup: AuthSession | undefined;
    transactionState: string | undefined;
    constructor($http: AxiosInstance, storage: Storage1, providerConfig: ProviderConfig, options: Opt);
    init(): Promise<Record<string, unknown> | undefined>;
    private resolveTransactionState;
    private addPkceAndNonce;
    private assertState;
    private initNative;
    _stringifyRequestParams(): string;
}
