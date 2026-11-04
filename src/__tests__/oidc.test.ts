import { AxiosInstance } from 'axios';
import { discoverOidc, validateIdTokenClaims } from '../oidc';
import { AuthError } from '../errors';

const now = 1_700_000_000;
const issuer = 'https://issuer.example.com';
const claims: Record<string, unknown> = {
  iss: issuer,
  aud: 'client-1',
  exp: now + 300,
  nonce: 'n1'
};
const expected = { issuer, audience: 'client-1', nonce: 'n1', now };

function httpReturning(data: unknown): AxiosInstance {
  return {
    get: jest.fn().mockResolvedValue({ data })
  } as unknown as AxiosInstance;
}

describe('validateIdTokenClaims', () => {
  it('accepts claims that match the expectations', () => {
    expect(() => validateIdTokenClaims(claims, expected)).not.toThrow();
  });

  it.each([
    ['issuer', { iss: 'https://evil.example.com' }],
    ['audience', { aud: 'other-client' }],
    ['nonce', { nonce: 'n2' }],
    ['expiry', { exp: now - 3600 }]
  ])('rejects a %s mismatch as invalid_token', (_label, override) => {
    expect(() => validateIdTokenClaims({ ...claims, ...override }, expected)).toThrow(
      AuthError
    );
  });

  it('requires azp when the token has several audiences', () => {
    const multi = { ...claims, aud: ['client-1', 'other'] };
    expect(() => validateIdTokenClaims(multi, expected)).toThrow(
      'authorized party'
    );
    expect(() =>
      validateIdTokenClaims({ ...multi, azp: 'client-1' }, expected)
    ).not.toThrow();
  });
});

describe('discoverOidc', () => {
  it('returns the document when the advertised issuer matches', async () => {
    const doc = await discoverOidc(
      `${issuer}/`,
      httpReturning({
        issuer,
        authorization_endpoint: `${issuer}/authorize`
      })
    );
    expect(doc.authorization_endpoint).toBe(`${issuer}/authorize`);
  });

  it('rejects a discovery document whose issuer differs', async () => {
    await expect(
      discoverOidc(
        issuer,
        httpReturning({
          issuer: 'https://evil.example.com',
          authorization_endpoint: 'https://evil.example.com/authorize'
        })
      )
    ).rejects.toThrow('issuer does not match');
  });

  it('refuses a non-https issuer', async () => {
    await expect(
      discoverOidc('http://issuer.example.com', httpReturning({}))
    ).rejects.toThrow('must use https');
  });
});
