import { createNativePlatform } from '../../platform/native';
import { TransactionStore } from '../../platform/transaction-store';
import type { KeyValueStore } from '../../platform/transaction-store';
import type { PlatformAdapter } from '../../platform/types';

/** Subset of `@capacitor/browser`. Passed in by the app, so this module never imports Capacitor. */
export interface CapacitorBrowser {
  open(options: { url: string }): Promise<unknown>;
  close(): Promise<unknown>;
}

/** Subset of `@capacitor/app`. */
export interface CapacitorApp {
  addListener(
    event: 'appUrlOpen',
    listener: (event: { url: string }) => void
  ): Promise<{ remove(): Promise<void> | void }>;
  getLaunchUrl(): Promise<{ url: string } | undefined>;
}

export interface CapacitorAdapterOptions {
  platform: 'ios' | 'android';
  browser: CapacitorBrowser;
  app: CapacitorApp;
  /** Backed by Keychain (iOS) or Keystore (Android). Pending sign-ins are stored here. */
  secureStorage: KeyValueStore;
  /** Allows http://localhost redirects. Set only for development builds. */
  development?: boolean;
}

/**
 * Creates the native adapter for a Capacitor app. Pass the result to `setPlatform`
 * before the first sign-in.
 */
export function createCapacitorAdapter(options: CapacitorAdapterOptions): PlatformAdapter {
  const { browser, app } = options;
  return createNativePlatform(options.platform, {
    bridge: {
      openUrl: async url => {
        await browser.open({ url });
      },
      closeBrowser: async () => {
        await browser.close();
      },
      onUrlOpen: listener => {
        let handle: { remove(): Promise<void> | void } | undefined;
        let unsubscribed = false;
        void app.addListener('appUrlOpen', event => listener(event.url)).then(next => {
          if (unsubscribed) {
            void next.remove();
          } else {
            handle = next;
          }
        });
        return () => {
          unsubscribed = true;
          void handle?.remove();
        };
      },
      getLaunchUrl: async () => (await app.getLaunchUrl())?.url
    },
    transactions: new TransactionStore(options.secureStorage),
    development: options.development ?? false
  });
}
