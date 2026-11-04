import { AuthError } from '../errors';
import type { CallbackParams } from './types';
export interface CallbackOptions {
    redirectUri: string;
    responseMode?: string | readonly string[];
    expectedState?: string;
    development?: boolean;
}
export type CallbackResult = {
    ok: true;
    params: CallbackParams;
} | {
    ok: false;
    error: AuthError;
};
export declare function isAllowedRedirectUri(redirectUri: string, development?: boolean): boolean;
export declare function matchesRedirectUri(callbackUrl: string, redirectUri: string): boolean;
export declare function readCallback(callbackUrl: string, options: CallbackOptions): CallbackResult;
