import type { TransactionStore } from './transaction-store';

/** Parsed redirect parameters returned by the provider. */
export type CallbackParams = Record<string, unknown>;

export interface CallbackValidation {
  responseMode?: string | readonly string[];
  expectedState?: string;
  expectedOAuth1Token?: string;
}

/**
 * One browser sign-in attempt. The implementation decides which surface runs the
 * provider login (a popup on the web, a system browser in native apps).
 */
export interface AuthSession {
  /** Opens the surface. Resolves with the callback unless `skipPooling` is set. */
  open(
    redirectUri: string,
    skipPooling: boolean,
    timeoutMs?: number,
    expectedState?: string,
    responseMode?: string | readonly string[]
  ): Promise<unknown>;
  /** Points an already-open surface at `url`. Resolves false when no surface is open. */
  navigate(url: string): Promise<boolean>;
  /** Resolves with the callback parameters once the redirect arrives. */
  waitForCallback(
    redirectUri: string,
    timeoutMs?: number,
    expectedState?: string,
    expectedOAuth1Token?: string,
    responseMode?: string | readonly string[]
  ): Promise<unknown>;
  /** Closes the surface if it is still open. */
  close(): void;
}

export type PlatformName = 'web' | 'ios' | 'android';

/** Injected by a native adapter. Core code never imports a native SDK. */
export interface NativeBridge {
  openUrl(url: string): Promise<void>;
  closeBrowser(): Promise<void>;
  /** Subscribes to app URL opens. Returns an unsubscribe function. */
  onUrlOpen(listener: (url: string) => void): () => void;
  getLaunchUrl(): Promise<string | undefined>;
}

export interface NativeContext {
  bridge: NativeBridge;
  transactions: TransactionStore;
  /** Allows http on localhost and 127.0.0.1 redirects. Set only for development builds. */
  development: boolean;
}

export interface PlatformAdapter {
  readonly kind: 'web' | 'native';
  readonly platform: PlatformName;
  /** Present when `kind` is `native`. */
  readonly native?: NativeContext;
  createSession(
    url: string,
    name: string,
    popupOptions: Record<string, unknown>
  ): AuthSession;
}
