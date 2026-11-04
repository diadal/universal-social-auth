import { applyPlatformOverrides } from '../providers/platforms';
import { validateProviderDefinition } from '../providers/schema';

const base = {
  name: 'acme',
  oauthType: '2.0',
  authorizationEndpoint: 'https://acme.example/authorize',
  clientId: 'web-client',
  redirectUri: 'https://app.example/callback'
};

describe('applyPlatformOverrides', () => {
  it('returns the same object when there is no override for the platform', () => {
    expect(applyPlatformOverrides(base, 'ios')).toBe(base);
  });

  it('prefers the platform override over the base values', () => {
    const config = {
      ...base,
      platforms: { ios: { clientId: 'ios-client', redirectUri: 'com.example.app://callback' } }
    };
    const resolved = applyPlatformOverrides(config, 'ios');
    expect(resolved.clientId).toBe('ios-client');
    expect(resolved.redirectUri).toBe('com.example.app://callback');
    expect(resolved.authorizationEndpoint).toBe(base.authorizationEndpoint);
  });

  it('keeps base values for fields the override leaves out', () => {
    const config = { ...base, platforms: { android: { clientId: 'android-client' } } };
    const resolved = applyPlatformOverrides(config, 'android');
    expect(resolved.clientId).toBe('android-client');
    expect(resolved.redirectUri).toBe(base.redirectUri);
  });

  it('does not change the base config for other platforms', () => {
    const config = { ...base, platforms: { ios: { clientId: 'ios-client' } } };
    expect(applyPlatformOverrides(config, 'web').clientId).toBe('web-client');
    expect(config.clientId).toBe('web-client');
  });
});

describe('validateProviderDefinition platforms', () => {
  const issuesFor = (platforms: unknown, development = false) =>
    validateProviderDefinition('acme', { ...base, platforms }, { development }).map(i => i.field);

  it('accepts valid overrides for each platform', () => {
    expect(
      issuesFor({
        web: { redirectUri: 'https://app.example/callback' },
        ios: { clientId: 'ios', redirectUri: 'com.example.app://callback' },
        android: { clientId: 42, redirectUri: 'https://app.example/android' }
      })
    ).toEqual([]);
  });

  it('rejects unknown platform keys and non-object values', () => {
    expect(issuesFor({ desktop: {} })).toEqual(['platforms']);
    expect(issuesFor(['ios'])).toEqual(['platforms']);
    expect(issuesFor({ ios: 'ios' })).toEqual(['platforms.ios']);
  });

  it('rejects empty clientId values', () => {
    expect(issuesFor({ ios: { clientId: '' } })).toEqual(['platforms.ios.clientId']);
  });

  it('rejects plain http redirects outside development', () => {
    expect(issuesFor({ web: { redirectUri: 'http://app.example/callback' } })).toEqual([
      'platforms.web.redirectUri'
    ]);
  });

  it('allows localhost redirects only when development is set', () => {
    const platforms = { web: { redirectUri: 'http://localhost:3000/callback' } };
    expect(issuesFor(platforms)).toEqual(['platforms.web.redirectUri']);
    expect(issuesFor(platforms, true)).toEqual([]);
  });
});
