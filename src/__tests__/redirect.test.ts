import {
  isAllowedRedirectUri,
  matchesRedirectUri,
  readCallback
} from '../platform/redirect';

const CUSTOM = 'myapp://auth/callback';
const WEB = 'https://app.example.com/cb';

function kindOf(redirectUri: string, callbackUrl: string, extra = {}) {
  const result = readCallback(callbackUrl, { redirectUri, ...extra });
  return result.ok ? 'ok' : result.error.kind;
}

describe('isAllowedRedirectUri', () => {
  it('allows https and custom schemes', () => {
    expect(isAllowedRedirectUri(WEB)).toBe(true);
    expect(isAllowedRedirectUri(CUSTOM)).toBe(true);
  });

  it('allows http only for loopback hosts in development', () => {
    expect(isAllowedRedirectUri('http://localhost:3000/cb', true)).toBe(true);
    expect(isAllowedRedirectUri('http://127.0.0.1/cb', true)).toBe(true);
    expect(isAllowedRedirectUri('http://localhost/cb', false)).toBe(false);
    expect(isAllowedRedirectUri('http://example.com/cb', true)).toBe(false);
  });

  it('rejects script-capable and malformed URIs', () => {
    expect(isAllowedRedirectUri('javascript:alert(1)')).toBe(false);
    expect(isAllowedRedirectUri('data:text/html,hi')).toBe(false);
    expect(isAllowedRedirectUri('not a url')).toBe(false);
  });
});

describe('matchesRedirectUri', () => {
  it('matches a custom scheme exactly on scheme, host, and path', () => {
    expect(matchesRedirectUri('myapp://auth/callback?code=1', CUSTOM)).toBe(true);
    expect(matchesRedirectUri('myapp://auth/other', CUSTOM)).toBe(false);
    expect(matchesRedirectUri('myapp://evil/callback', CUSTOM)).toBe(false);
    expect(matchesRedirectUri('otherapp://auth/callback', CUSTOM)).toBe(false);
  });

  it('matches an https app link exactly and rejects other hosts', () => {
    expect(matchesRedirectUri('https://app.example.com/cb#x=1', WEB)).toBe(true);
    expect(matchesRedirectUri('https://evil.example.com/cb', WEB)).toBe(false);
    expect(matchesRedirectUri('https://app.example.com/cb/extra', WEB)).toBe(false);
    expect(matchesRedirectUri('http://app.example.com/cb', WEB)).toBe(false);
  });

  it('rejects unparseable input', () => {
    expect(matchesRedirectUri('nope', WEB)).toBe(false);
  });
});

describe('readCallback', () => {
  it('reads query params when the provider declares query', () => {
    const result = readCallback(`${CUSTOM}?code=abc&state=s1`, {
      redirectUri: CUSTOM,
      responseMode: 'query',
      expectedState: 's1'
    });
    expect(result).toEqual({ ok: true, params: { code: 'abc', state: 's1' } });
  });

  it('defaults to query when no response mode is declared', () => {
    expect(kindOf(CUSTOM, `${CUSTOM}?code=abc`)).toBe('ok');
  });

  it('reads fragment params when the provider declares fragment', () => {
    const result = readCallback(`${WEB}#id_token=t&state=s1`, {
      redirectUri: WEB,
      responseMode: 'fragment',
      expectedState: 's1'
    });
    expect(result).toEqual({ ok: true, params: { id_token: 't', state: 's1' } });
  });

  it('keeps `=` characters inside values', () => {
    const result = readCallback(`${CUSTOM}?code=ab%3D%3D`, { redirectUri: CUSTOM });
    expect(result).toEqual({ ok: true, params: { code: 'ab==' } });
  });

  it('reads form_post callbacks relayed as a query string', () => {
    expect(kindOf(CUSTOM, `${CUSTOM}?code=abc`, { responseMode: ['form_post'] })).toBe('ok');
  });

  it('rejects params from a mode the provider does not declare', () => {
    expect(kindOf(CUSTOM, `${CUSTOM}#code=abc`, { responseMode: 'query' })).toBe('provider');
    expect(kindOf(CUSTOM, `${CUSTOM}?code=abc`, { responseMode: 'fragment' })).toBe('provider');
  });

  it('maps access_denied to cancelled and other errors to provider', () => {
    expect(kindOf(CUSTOM, `${CUSTOM}?error=access_denied`)).toBe('cancelled');
    expect(kindOf(CUSTOM, `${CUSTOM}?error=server_error`)).toBe('provider');
  });

  it('rejects a redirect with no params', () => {
    expect(kindOf(CUSTOM, CUSTOM)).toBe('provider');
  });

  it('rejects a state mismatch but skips the check when no state is expected', () => {
    expect(kindOf(CUSTOM, `${CUSTOM}?code=a&state=attacker`, { expectedState: 's1' })).toBe(
      'state_mismatch'
    );
    expect(kindOf(CUSTOM, `${CUSTOM}?code=a`, { expectedState: 's1' })).toBe('state_mismatch');
    expect(kindOf(CUSTOM, `${CUSTOM}?code=a`)).toBe('ok');
  });

  it('rejects a callback that does not match the redirect URI', () => {
    expect(kindOf(CUSTOM, `myapp://other/callback?code=a`)).toBe('provider');
  });

  it('rejects a disallowed redirect URI before reading params', () => {
    expect(kindOf('http://example.com/cb', 'http://example.com/cb?code=a')).toBe('config');
  });
});
