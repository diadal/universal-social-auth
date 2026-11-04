import type { NativeContext, CallbackParams } from './types';
import type { PendingTransaction } from './transaction-store';
import { readCallback } from './redirect';
import { AuthError } from '../errors';

export interface ResumedSignIn {
  provider: string;
  params: CallbackParams;
}

/**
 * Completes a sign-in whose callback arrived while the app was not running
 * (cold start). Looks up the saved transaction by `state` (OAuth 2.0) or
 * `oauth_token` (OAuth 1.0) and consumes it, so a URL can only resume once.
 */
export async function resumePendingSignIn(
  url: string,
  native: NativeContext,
  redirectUri: string
): Promise<ResumedSignIn> {
  const result = readCallback(url, { redirectUri, development: native.development });
  if (!result.ok) throw result.error;

  const key = keyFromParams(result.params);
  const pending = key ? await native.transactions.consume(key) : undefined;
  if (!pending) {
    throw new AuthError('state_mismatch', 'No pending sign-in matches this callback');
  }
  return { provider: pending.provider, params: mergeTransaction(result.params, pending) };
}

function keyFromParams(params: CallbackParams): string | undefined {
  if (typeof params.state === 'string') return params.state;
  if (typeof params.oauth_token === 'string') return params.oauth_token;
  return undefined;
}

function mergeTransaction(params: CallbackParams, pending: PendingTransaction): CallbackParams {
  const merged: CallbackParams = { ...params };
  if (pending.codeVerifier !== undefined) merged.codeVerifier = pending.codeVerifier;
  if (pending.nonce !== undefined) merged.nonce = pending.nonce;
  if (pending.oauth1RequestTokenSecret !== undefined) {
    merged.oauth_token_secret = pending.oauth1RequestTokenSecret;
  }
  return merged;
}
