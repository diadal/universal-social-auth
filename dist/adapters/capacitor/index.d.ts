import type { KeyValueStore } from '../../platform/transaction-store';
import type { PlatformAdapter } from '../../platform/types';
export interface CapacitorBrowser {
    open(options: {
        url: string;
    }): Promise<unknown>;
    close(): Promise<unknown>;
}
export interface CapacitorApp {
    addListener(event: 'appUrlOpen', listener: (event: {
        url: string;
    }) => void): Promise<{
        remove(): Promise<void> | void;
    }>;
    getLaunchUrl(): Promise<{
        url: string;
    } | undefined>;
}
export interface CapacitorAdapterOptions {
    platform: 'ios' | 'android';
    browser: CapacitorBrowser;
    app: CapacitorApp;
    secureStorage: KeyValueStore;
    development?: boolean;
}
export declare function createCapacitorAdapter(options: CapacitorAdapterOptions): PlatformAdapter;
