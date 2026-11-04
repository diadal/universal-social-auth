import type { NativeContext, CallbackParams } from './types';
export interface ResumedSignIn {
    provider: string;
    params: CallbackParams;
}
export declare function resumePendingSignIn(url: string, native: NativeContext, redirectUri: string): Promise<ResumedSignIn>;
