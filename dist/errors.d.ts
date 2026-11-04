export type AuthErrorKind = 'cancelled' | 'popup_blocked' | 'timeout' | 'state_mismatch' | 'invalid_token' | 'provider' | 'config' | 'unknown';
export declare class AuthError extends Error {
    readonly kind: AuthErrorKind;
    constructor(kind: AuthErrorKind, message: string);
}
export declare function classifyError(err: unknown): AuthErrorKind;
export type AuthOutcome<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    kind: AuthErrorKind;
    error: Error;
};
export declare function toOutcome<T>(work: Promise<T>): Promise<AuthOutcome<T>>;
