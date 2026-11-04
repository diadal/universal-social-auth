interface ProderT {
    [x: string]: Record<string, unknown>;
}
declare const Providers: ProderT;
declare const Apple: Record<string, unknown>;
declare const Facebook: Record<string, unknown>;
declare const Google: Record<string, unknown>;
declare const Github: Record<string, unknown>;
declare const Instagram: Record<string, unknown>;
declare const Twitter: Record<string, unknown>;
declare const Bitbucket: Record<string, unknown>;
declare const Linkedin: Record<string, unknown>;
declare const Vkontakte: Record<string, unknown>;
declare const Live: Record<string, unknown>;
declare const Discord: Record<string, unknown>;
declare const Twitch: Record<string, unknown>;
declare const Microsoft: Record<string, unknown>;
declare const Gitlab: Record<string, unknown>;
declare const Slack: Record<string, unknown>;
declare const Spotify: Record<string, unknown>;
declare const Reddit: Record<string, unknown>;
declare const Dropbox: Record<string, unknown>;
declare const Amazon: Record<string, unknown>;
declare const Oauth1: Record<string, unknown>;
declare const Oauth2: Record<string, unknown>;
export { Providers, Apple, Facebook, Google, Github, Instagram, Bitbucket, Twitter, Vkontakte, Live, Linkedin, Discord, Twitch, Microsoft, Gitlab, Slack, Spotify, Reddit, Dropbox, Amazon, Oauth2, Oauth1, ProderT };
export { PROVIDER_SCHEMA_VERSION, validateProviderDefinition } from './schema';
export type { ProviderIssue } from './schema';
