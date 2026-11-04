interface ProderT {
  [x: string]: Record<string, unknown>;
}

// `window` is undefined during SSR (e.g. Nuxt), so resolve the origin lazily.
const origin: string =
  typeof window !== 'undefined' ? window.location.origin : '';

const Providers: ProderT = {
  apple: {
    name: 'apple',
    url: '',
    authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
    redirectUri: origin + '/',
    requiredUrlParams: ['scope'],
    optionalUrlParams: ['response_mode'],
    responseType: 'code id_token',
    responseMode: 'form_post',
    scope: ['name', 'email'],
    scopeDelimiter: '%20',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 460, height: 600 }
  },
  facebook: {
    name: 'facebook',
    url: '/auth/facebook',
    authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
    redirectUri: origin + '/',
    responseMode: ['form_post'],
    requiredUrlParams: ['scope'],
    scope: ['email'],
    scopeDelimiter: ',',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 580, height: 400 }
  },

  google: {
    name: 'google',
    url: '/auth/google',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    optionalUrlParams: ['display'],
    scope: ['profile', 'email'],
    scopePrefix: 'openid',
    scopeDelimiter: ' ',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 452, height: 633 }
  },

  github: {
    name: 'github',
    url: '/auth/github',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    redirectUri: origin,
    optionalUrlParams: ['scope'],
    scope: ['user:email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 1020, height: 618 }
  },

  instagram: {
    name: 'instagram',
    url: '/auth/instagram',
    authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['basic'],
    scopeDelimiter: '+',
    oauthType: '2.0',
    popupOptions: { width: null, height: null }
  },

  twitter: {
    name: 'twitter',
    url: '/auth/twitter',
    authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
    redirectUri: origin,
    oauthType: '1.0',
    popupOptions: { width: 495, height: 645 }
  },
  bitbucket: {
    name: 'bitbucket',
    url: '/auth/bitbucket',
    authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
    redirectUri: origin + '/',
    optionalUrlParams: ['scope'],
    scope: ['email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 1020, height: 618 }
  },

  linkedin: {
    name: 'linkedin',
    url: '/auth/linkedin',
    authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    redirectUri: origin,
    requiredUrlParams: ['state', 'scope'],
    scope: ['r_emailaddress'],
    scopeDelimiter: ' ',
    state: 'STATE',
    oauthType: '2.0',
    popupOptions: { width: 527, height: 582 }
  },

  vkontakte: {
    name: 'vkontakte',
    url: '/auth/vkontakte',
    authorizationEndpoint: 'https://oauth.vk.com/authorize',
    redirectUri: origin + '/',
    requiredUrlParams: ['scope'],
    scope: ['email'],
    scopeDelimiter: ',',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 580, height: 400 }
  },

  live: {
    name: 'live',
    url: '/auth/live',
    authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
    redirectUri: origin,
    requiredUrlParams: ['display', 'scope'],
    scope: ['wl.emails'],
    scopeDelimiter: ' ',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 500, height: 560 }
  },

  discord: {
    name: 'discord',
    url: '/auth/discord',
    authorizationEndpoint: 'https://discord.com/oauth2/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['identify', 'email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 500, height: 750 }
  },

  twitch: {
    name: 'twitch',
    url: '/auth/twitch',
    authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['user:read:email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 500, height: 700 }
  },

  microsoft: {
    name: 'microsoft',
    url: '/auth/microsoft',
    authorizationEndpoint:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['openid', 'profile', 'email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 500, height: 600 }
  },

  gitlab: {
    name: 'gitlab',
    url: '/auth/gitlab',
    authorizationEndpoint: 'https://gitlab.com/oauth/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['read_user'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 1020, height: 618 }
  },

  slack: {
    name: 'slack',
    url: '/auth/slack',
    authorizationEndpoint: 'https://slack.com/openid/connect/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['openid', 'profile', 'email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 600, height: 700 }
  },

  spotify: {
    name: 'spotify',
    url: '/auth/spotify',
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['user-read-email'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 500, height: 700 }
  },

  reddit: {
    name: 'reddit',
    url: '/auth/reddit',
    authorizationEndpoint: 'https://www.reddit.com/api/v1/authorize',
    redirectUri: origin,
    requiredUrlParams: ['state', 'scope'],
    scope: ['identity'],
    scopeDelimiter: ' ',
    state: 'STATE',
    oauthType: '2.0',
    popupOptions: { width: 600, height: 700 }
  },

  dropbox: {
    name: 'dropbox',
    url: '/auth/dropbox',
    authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
    redirectUri: origin,
    oauthType: '2.0',
    popupOptions: { width: 600, height: 700 }
  },

  amazon: {
    name: 'amazon',
    url: '/auth/amazon',
    authorizationEndpoint: 'https://www.amazon.com/ap/oa',
    redirectUri: origin,
    requiredUrlParams: ['scope'],
    scope: ['profile'],
    scopeDelimiter: ' ',
    oauthType: '2.0',
    popupOptions: { width: 600, height: 700 }
  },

  oauth1: {
    name: null,
    url: '/auth/oauth1',
    authorizationEndpoint: null,
    redirectUri: origin,
    oauthType: '1.0',
    popupOptions: null
  },

  oauth2: {
    name: null,
    url: '/auth/oauth2',
    clientId: null,
    redirectUri: origin,
    authorizationEndpoint: null,
    defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
    requiredUrlParams: null,
    optionalUrlParams: null,
    scope: null,
    scopePrefix: null,
    scopeDelimiter: null,
    state: null,
    oauthType: '2.0',
    popupOptions: null,
    responseType: 'code',
    responseParams: {
      code: 'code',
      clientId: 'clientId',
      redirectUri: 'redirectUri'
    }
  }
};

const Apple = Providers.apple;
const Facebook = Providers.facebook;
const Google = Providers.google;
const Github = Providers.github;
const Instagram = Providers.instagram;
const Twitter = Providers.twitter;
const Bitbucket = Providers.bitbucket;
const Linkedin = Providers.linkedin;
const Vkontakte = Providers.vkontakte;
const Live = Providers.live;
const Discord = Providers.discord;
const Twitch = Providers.twitch;
const Microsoft = Providers.microsoft;
const Gitlab = Providers.gitlab;
const Slack = Providers.slack;
const Spotify = Providers.spotify;
const Reddit = Providers.reddit;
const Dropbox = Providers.dropbox;
const Amazon = Providers.amazon;
const Oauth1 = Providers.oauth1;
const Oauth2 = Providers.oauth2;
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
  ProderT
};

export { PROVIDER_SCHEMA_VERSION, validateProviderDefinition } from './schema';
export type { ProviderIssue } from './schema';
