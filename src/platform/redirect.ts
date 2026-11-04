import { AuthError } from '../errors';
import type { CallbackParams } from './types';

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);
const BLOCKED_PROTOCOLS = new Set(['javascript:', 'data:', 'vbscript:', 'file:', 'blob:']);

export interface CallbackOptions {
  /** The redirect URI configured for the provider. */
  redirectUri: string;
  /** Response modes the provider config declares. Defaults to `query`. */
  responseMode?: string | readonly string[];
  /** Expected `state`. Native callers always pass it. Skipped when undefined. */
  expectedState?: string;
  /** Allows http on localhost and 127.0.0.1. Set only for development builds. */
  development?: boolean;
}

export type CallbackResult =
  | { ok: true; params: CallbackParams }
  | { ok: false; error: AuthError };

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * Accepts https, custom schemes, and http only for loopback hosts in development.
 * Script-capable schemes are always rejected.
 */
export function isAllowedRedirectUri(redirectUri: string, development = false): boolean {
  const url = parseUrl(redirectUri);
  if (!url || BLOCKED_PROTOCOLS.has(url.protocol)) return false;
  if (url.protocol === 'https:') return true;
  if (url.protocol === 'http:') {
    return development && LOOPBACK_HOSTS.has(url.hostname);
  }
  return true;
}

/** Exact match on scheme, host (including port), and path. Query and fragment are ignored. */
export function matchesRedirectUri(callbackUrl: string, redirectUri: string): boolean {
  const callback = parseUrl(callbackUrl);
  const expected = parseUrl(redirectUri);
  if (!callback || !expected) return false;
  return (
    callback.protocol === expected.protocol &&
    callback.host.toLowerCase() === expected.host.toLowerCase() &&
    callback.pathname === expected.pathname
  );
}

function declaredModes(responseMode: CallbackOptions['responseMode']): Set<string> {
  if (responseMode === undefined) return new Set(['query']);
  return new Set(typeof responseMode === 'string' ? [responseMode] : responseMode);
}

function toParams(search: URLSearchParams): CallbackParams {
  const out: CallbackParams = {};
  search.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function fail(kind: AuthError['kind'], message: string): CallbackResult {
  return { ok: false, error: new AuthError(kind, message) };
}

/**
 * Validates a redirect callback URL and returns its parameters, or a classified error.
 * Params are read only from the sources the provider declares. `form_post` callbacks
 * are relayed to the app as a query string, so they are read from the query.
 */
export function readCallback(callbackUrl: string, options: CallbackOptions): CallbackResult {
  if (!isAllowedRedirectUri(options.redirectUri, options.development)) {
    return fail('config', 'Redirect URI is not allowed for this build');
  }
  if (!matchesRedirectUri(callbackUrl, options.redirectUri)) {
    return fail('provider', 'Callback URL does not match the redirect URI');
  }

  const url = new URL(callbackUrl);
  const modes = declaredModes(options.responseMode);
  const hasFragment = url.hash.length > 1;
  const hasQuery = url.search.length > 1;
  const queryAllowed = modes.has('query') || modes.has('form_post');

  if ((hasFragment && !modes.has('fragment')) || (hasQuery && !queryAllowed)) {
    return fail('provider', 'Callback used a response mode the provider does not declare');
  }

  const params: CallbackParams = {
    ...(queryAllowed ? toParams(url.searchParams) : {}),
    ...(modes.has('fragment') ? toParams(new URLSearchParams(url.hash.slice(1))) : {})
  };
  if (Object.keys(params).length === 0) {
    return fail('provider', 'OAuth redirect has occurred but no query or hash parameters were found.');
  }

  if (options.expectedState !== undefined && params.state !== options.expectedState) {
    return fail('state_mismatch', 'OAuth state mismatch');
  }

  if (params.error) {
    return params.error === 'access_denied'
      ? fail('cancelled', 'Authorization was denied')
      : fail('provider', 'OAuth provider returned an error');
  }

  return { ok: true, params };
}
