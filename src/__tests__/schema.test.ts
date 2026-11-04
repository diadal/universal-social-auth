import { Providers, validateProviderDefinition } from '../providers';

describe('provider schema', () => {
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
});
