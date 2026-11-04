/**
 * @jest-environment node
 */
import { createCodeChallenge, createCodeVerifier } from '../pkce';

describe('PKCE helpers', () => {
  it('matches the RFC 7636 Appendix B S256 test vector', async () => {
    expect(
      await createCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')
    ).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('creates verifiers that satisfy RFC 7636 length and charset rules', () => {
    expect(createCodeVerifier()).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
  });
});
