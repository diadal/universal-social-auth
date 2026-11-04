import type { TransactionStore } from './transaction-store';
export type CallbackParams = Record<string, unknown>;
export interface CallbackValidation {
    responseMode?: string | readonly string[];
    expectedState?: string;
    expectedOAuth1Token?: string;
}
export interface AuthSession {
    open(redirectUri: string, skipPooling: boolean, timeoutMs?: number, expectedState?: string, responseMode?: string | readonly string[]): Promise<unknown>;
    navigate(url: string): Promise<boolean>;
    waitForCallback(redirectUri: string, timeoutMs?: number, expectedState?: string, expectedOAuth1Token?: string, responseMode?: string | readonly string[]): Promise<unknown>;
    close(): void;
}
export type PlatformName = 'web' | 'ios' | 'android';
export interface NativeBridge {
    openUrl(url: string): Promise<void>;
    closeBrowser(): Promise<void>;
    onUrlOpen(listener: (url: string) => void): () => void;
    getLaunchUrl(): Promise<string | undefined>;
}
export interface NativeContext {
    bridge: NativeBridge;
    transactions: TransactionStore;
    development: boolean;
}
export interface PlatformAdapter {
    readonly kind: 'web' | 'native';
    readonly platform: PlatformName;
    readonly native?: NativeContext;
    createSession(url: string, name: string, popupOptions: Record<string, unknown>): AuthSession;
}
