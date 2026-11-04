function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getCrypto(): Crypto {
  if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
    throw new Error('Web Crypto (crypto.subtle) is required for PKCE');
  }
  return globalThis.crypto;
}

/** Cryptographically random, URL-safe string (base64url of `byteLength` bytes). */
export function createRandomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  getCrypto().getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** RFC 7636 code verifier: 43 to 128 unreserved characters. */
export function createCodeVerifier(): string {
  return createRandomString(64);
}

/** RFC 7636 S256 code challenge: BASE64URL(SHA256(verifier)). */
export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await getCrypto().subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return base64UrlEncode(new Uint8Array(digest));
}
