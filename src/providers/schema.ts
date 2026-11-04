export const PROVIDER_SCHEMA_VERSION = 1;

export interface ProviderIssue {
  provider: string;
  field: string;
  message: string;
}

function isHttpsOrLocalhost(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

function checkScope(scope: unknown): string | null {
  const scopes = Array.isArray(scope) ? scope : [scope];
  if (typeof scope !== 'string' && !Array.isArray(scope)) {
    return 'scope must be a string or an array of strings';
  }
  for (const item of scopes) {
    if (typeof item !== 'string' || item.length === 0 || /\s/.test(item)) {
      return 'scope entries must be non-empty strings without whitespace';
    }
  }
  return null;
}

/**
 * Structural checks for a provider definition. Returns an empty array when the
 * definition is valid. Does not contact the provider.
 */
export function validateProviderDefinition(
  name: string,
  definition: Record<string, unknown>
): ProviderIssue[] {
  const issues: ProviderIssue[] = [];
  const report = (field: string, message: string) =>
    issues.push({ provider: name, field, message });

  if (definition.name !== name) {
    report('name', 'name must match the provider key');
  }

  if (definition.oauthType !== '1.0' && definition.oauthType !== '2.0') {
    report('oauthType', "oauthType must be '1.0' or '2.0'");
  }

  const endpoint = definition.authorizationEndpoint;
  if (typeof endpoint !== 'string' || !isHttpsOrLocalhost(endpoint)) {
    report('authorizationEndpoint', 'authorizationEndpoint must be an https URL');
  }

  if (definition.redirectUri !== undefined && typeof definition.redirectUri !== 'string') {
    report('redirectUri', 'redirectUri must be a string');
  }

  if (definition.scope !== undefined) {
    const scopeError = checkScope(definition.scope);
    if (scopeError) report('scope', scopeError);
  }

  // OAuth 1.0 needs the backend request-token route (`url`) for the callback.
  if (definition.oauthType === '1.0' && (typeof definition.url !== 'string' || !definition.url)) {
    report('url', 'OAuth 1.0 providers need a backend url for the request-token step');
  }

  // An id_token in the response type must come back via form_post or fragment.
  if (
    typeof definition.responseType === 'string' &&
    definition.responseType.split(' ').includes('id_token') &&
    definition.responseMode !== 'form_post' &&
    definition.responseMode !== 'fragment'
  ) {
    report('responseMode', "responseType 'id_token' requires responseMode 'form_post' or 'fragment'");
  }

  return issues;
}
