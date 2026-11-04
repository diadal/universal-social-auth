import { Providers, validateProviderDefinition } from '../providers';

describe('provider schema', () => {
  it('does not use a fixed state for LinkedIn or Reddit', () => {
    expect(Providers.linkedin.state).toBeUndefined();
    expect(Providers.reddit.state).toBeUndefined();
  });

  it('accepts every built-in provider except the generic placeholders', () => {
    const placeholders = new Set(['oauth1', 'oauth2']);
    const issues = Object.keys(Providers)
      .filter(name => !placeholders.has(name))
      .reduce<ReturnType<typeof validateProviderDefinition>>(
        (acc, name) => acc.concat(validateProviderDefinition(name, Providers[name])),
        []
      );
    expect(issues).toEqual([]);
  });

  it('reports structural problems in a custom definition', () => {
    const issues = validateProviderDefinition('custom', {
      name: 'other',
      oauthType: '3.0',
      authorizationEndpoint: 'http://evil.example.com/authorize',
      scope: ['bad scope']
    });
    expect(issues.map(issue => issue.field).sort()).toEqual(
      ['authorizationEndpoint', 'name', 'oauthType', 'scope'].sort()
    );
  });

  it('requires a backend url for OAuth 1.0 providers', () => {
    const issues = validateProviderDefinition('legacy', {
      name: 'legacy',
      oauthType: '1.0',
      authorizationEndpoint: 'https://example.com/authorize'
    });
    expect(issues.map(issue => issue.field)).toEqual(['url']);
  });

  it('requires form_post or fragment when id_token is requested', () => {
    const issues = validateProviderDefinition('oidc', {
      name: 'oidc',
      oauthType: '2.0',
      authorizationEndpoint: 'https://example.com/authorize',
      responseType: 'code id_token',
      responseMode: 'query'
    });
    expect(issues.map(issue => issue.field)).toEqual(['responseMode']);
  });
});
