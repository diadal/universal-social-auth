import UniversalSocialauth from './authenticate';

export {
  AuthError,
  classifyError,
  toOutcome
} from './errors';
export type { AuthErrorKind, AuthOutcome } from './errors';
export type { LifecycleHooks, LifecycleEvent, LifecycleErrorEvent } from './lifecycle';
export { createCodeVerifier, createCodeChallenge } from './pkce';
export { discoverOidc, validateIdTokenClaims } from './oidc';
export type { IdTokenExpectations, OidcDiscoveryDocument } from './oidc';
export { validateProviderDefinition, PROVIDER_SCHEMA_VERSION } from './providers';
export type { ProviderIssue } from './providers';

export {
  Providers,
  Apple,
  Facebook,
  Google,
  Github,
  Instagram,
  Bitbucket,
  Twitter,
  Vkontakte,
  Live,
  Linkedin,
  Discord,
  Twitch,
  Microsoft,
  Gitlab,
  Slack,
  Spotify,
  Reddit,
  Dropbox,
  Amazon,
  Oauth2,
  Oauth1,
  type ProderT
} from './providers';

 export {

  UniversalSocialauth
 }

export default UniversalSocialauth;
