import type {
  AuthSession,
  CallbackParams,
  CallbackValidation,
  NativeBridge,
  NativeContext,
  PlatformAdapter
} from './types';
import { matchesRedirectUri, readCallback } from './redirect';
import { AuthError } from '../errors';

interface Waiter {
  redirectUri: string;
  validation?: CallbackValidation;
  resolve: (params: CallbackParams) => void;
  reject: (error: unknown) => void;
  timer?: ReturnType<typeof setTimeout>;
}

interface RoutedCallback {
  waiter: Waiter;
  result: ReturnType<typeof readCallback>;
}

function matchesCallbackIdentity(url: string, validation?: CallbackValidation): boolean {
  if (
    validation?.expectedState === undefined &&
    validation?.expectedOAuth1Token === undefined
  ) {
    return true;
  }
  const parsed = new URL(url);
  const sources = [parsed.searchParams, new URLSearchParams(parsed.hash.slice(1))];
  return (
    (validation.expectedState === undefined ||
      sources.some(params => params.get('state') === validation.expectedState)) &&
    (validation.expectedOAuth1Token === undefined ||
      sources.some(params => params.get('oauth_token') === validation.expectedOAuth1Token))
  );
}

function routeCallback(
  url: string,
  candidates: Waiter[],
  native: NativeContext
): RoutedCallback | undefined {
  let stateMismatch: RoutedCallback | undefined;
  for (const waiter of candidates) {
    if (!matchesCallbackIdentity(url, waiter.validation)) {
      stateMismatch = {
        waiter,
        result: {
          ok: false,
          error: new AuthError(
            'state_mismatch',
            waiter.validation?.expectedOAuth1Token !== undefined
              ? 'OAuth request token mismatch'
              : 'OAuth state mismatch'
          )
        }
      };
      continue;
    }
    const result = readCallback(url, {
      redirectUri: waiter.redirectUri,
      development: native.development,
      responseMode: waiter.validation?.responseMode,
      expectedState: waiter.validation?.expectedState
    });
    if (!result.ok && result.error.kind === 'state_mismatch') {
      stateMismatch = { waiter, result };
      continue;
    }
    return { waiter, result };
  }
  return candidates.length === 1 ? stateMismatch : undefined;
}

/** Placeholder used by OAuth 1.0 to open the session before the request token exists. */
const BLANK_URL = 'about:blank';

class NativeAuthSession implements AuthSession {
  private url: string;

  constructor(
    url: string,
    private readonly bridge: NativeBridge,
    private readonly waiters: Set<Waiter>
  ) {
    this.url = url;
  }

  async open(
    redirectUri: string,
    skipPooling: boolean,
    timeoutMs?: number,
    expectedState?: string,
    responseMode?: string | readonly string[]
  ): Promise<unknown> {
    if (this.url !== BLANK_URL) {
      await this.bridge.openUrl(this.url);
    }
    if (skipPooling) return undefined;
    return this.waitForCallback(redirectUri, timeoutMs, expectedState, undefined, responseMode);
  }

  async navigate(url: string): Promise<boolean> {
    this.url = url;
    try {
      await this.bridge.openUrl(url);
      return true;
    } catch {
      return false;
    }
  }

  waitForCallback(
    redirectUri: string,
    timeoutMs?: number,
    expectedState?: string,
    expectedOAuth1Token?: string,
    responseMode?: string | readonly string[]
  ): Promise<unknown> {
    return new Promise<CallbackParams>((resolve, reject) => {
      const validation: CallbackValidation = {
        expectedState,
        responseMode,
        expectedOAuth1Token
      };
      const waiter: Waiter = { redirectUri, validation, resolve, reject };
      if (timeoutMs !== undefined) {
        waiter.timer = setTimeout(() => {
          this.waiters.delete(waiter);
          reject(new AuthError('timeout', 'OAuth callback timed out'));
        }, timeoutMs);
      }
      this.waiters.add(waiter);
    });
  }

  close(): void {
    void this.bridge.closeBrowser();
  }
}

/**
 * Builds the adapter for iOS or Android. The bridge is injected by the host app
 * (for example the Capacitor adapter), so core code does not import a native SDK.
 */
export function createNativePlatform(
  platform: 'ios' | 'android',
  native: NativeContext
): PlatformAdapter {
  const waiters = new Set<Waiter>();

  native.bridge.onUrlOpen(url => {
    const candidates = Array.from(waiters).filter(waiter =>
      matchesRedirectUri(url, waiter.redirectUri)
    );
    if (candidates.length === 0) return;
    const routed = routeCallback(url, candidates, native);
    if (!routed) return;

    const { waiter, result } = routed;
    waiters.delete(waiter);
    if (waiter.timer) clearTimeout(waiter.timer);
    if (result.ok) {
      waiter.resolve(result.params);
    } else {
      waiter.reject(result.error);
    }
  });

  return {
    kind: 'native',
    platform,
    native,
    createSession(url: string): AuthSession {
      return new NativeAuthSession(url, native.bridge, waiters);
    }
  };
}
