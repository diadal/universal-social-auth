import { AxiosInstance } from 'axios';
import { AuthError } from './errors';

export interface OidcDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint?: string;
  jwks_uri?: string;
  [x: string]: unknown;
}

export interface IdTokenExpectations {
  issuer: string;
  audience: string;
  nonce?: string;
  /** Unix seconds; defaults to the current time. */
  now?: number;
  clockSkewSeconds?: number;
}

function normalizeIssuer(issuer: string): string {
  // Loop instead of /\/+$/, which backtracks super-linearly on long inputs.
  let end = issuer.length;
  while (end > 0 && issuer.charAt(end - 1) === '/') {
    end--;
  }
  return issuer.slice(0, end);
}

function assertSecureUrl(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new AuthError('config', `OIDC ${field} is missing`);
  }
  const url = new URL(value);
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal)) {
    throw new AuthError('config', `OIDC ${field} must use https`);
  }
  return value;
}

/**
 * Fetches `<issuer>/.well-known/openid-configuration` and checks that the
 * advertised issuer matches the requested one.
 */
export async function discoverOidc(
  issuer: string,
  $http: AxiosInstance
): Promise<OidcDiscoveryDocument> {
  const base = normalizeIssuer(assertSecureUrl(issuer, 'issuer'));
  const response = await $http.get<OidcDiscoveryDocument>(
    `${base}/.well-known/openid-configuration`
  );
  const document = response.data;
  if (!document || typeof document !== 'object') {
    throw new AuthError('config', 'OIDC discovery document is invalid');
  }
  if (typeof document.issuer !== 'string' || normalizeIssuer(document.issuer) !== base) {
    throw new AuthError('invalid_token', 'OIDC discovery issuer does not match');
  }
  assertSecureUrl(document.authorization_endpoint, 'authorization_endpoint');
  return document;
}

/**
 * Checks ID token claims that have already been decoded and verified by the
 * server. Signature validation must happen on the backend.
 */
export function validateIdTokenClaims(
  claims: Record<string, unknown>,
  expected: IdTokenExpectations
): void {
  const issuer = typeof claims.iss === 'string' ? claims.iss : '';
  if (normalizeIssuer(issuer) !== normalizeIssuer(expected.issuer)) {
    throw new AuthError('invalid_token', 'ID token issuer mismatch');
  }

  const audience: unknown[] = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audience.includes(expected.audience)) {
    throw new AuthError('invalid_token', 'ID token audience mismatch');
  }
  if (audience.length > 1 && claims.azp !== expected.audience) {
    throw new AuthError('invalid_token', 'ID token authorized party mismatch');
  }

  const now = expected.now ?? Math.floor(Date.now() / 1000);
  const skew = expected.clockSkewSeconds ?? 60;
  if (typeof claims.exp !== 'number' || claims.exp + skew < now) {
    throw new AuthError('invalid_token', 'ID token has expired');
  }

  if (expected.nonce !== undefined && claims.nonce !== expected.nonce) {
    throw new AuthError('invalid_token', 'ID token nonce mismatch');
  }
}
