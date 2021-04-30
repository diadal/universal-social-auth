import { AxiosInstance } from 'axios';
import { ProderT } from './providers';
import { Opt, Storage1 } from './oauth/oauth2';
export default class UniversalSocialauth {
    options: Opt | undefined;
    storage: Storage1 | undefined;
    $http: AxiosInstance | undefined;
    OverrideOptions: Record<string, unknown> | undefined;
    defaultOptions: Record<string, unknown> | undefined;
    constructor($http: AxiosInstance, overrideOptions: Record<string, unknown>);
    authenticate(provider: string, ProData: ProderT, userData?: {}): Promise<any>;
}
