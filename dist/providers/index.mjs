// src/providers/index.ts
var e = typeof window < "u" ? window.location.origin : "", t = {
	apple: {
		name: "apple",
		url: "",
		authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
		redirectUri: e + "/",
		requiredUrlParams: ["scope"],
		optionalUrlParams: ["response_mode"],
		responseType: "code id_token",
		responseMode: "form_post",
		scope: ["name", "email"],
		scopeDelimiter: "%20",
		display: "popup",
		oauthType: "2.0",
		popupOptions: {
			width: 460,
			height: 600
		}
	},
	facebook: {
		name: "facebook",
		url: "/auth/facebook",
		authorizationEndpoint: "https://www.facebook.com/v2.5/dialog/oauth",
		redirectUri: e + "/",
		responseMode: ["form_post"],
		requiredUrlParams: ["scope"],
		scope: ["email"],
		scopeDelimiter: ",",
		display: "popup",
		oauthType: "2.0",
		popupOptions: {
			width: 580,
			height: 400
		}
	},
	google: {
		name: "google",
		url: "/auth/google",
		authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		optionalUrlParams: ["display"],
		scope: ["profile", "email"],
		scopePrefix: "openid",
		scopeDelimiter: " ",
		display: "popup",
		oauthType: "2.0",
		popupOptions: {
			width: 452,
			height: 633
		}
	},
	github: {
		name: "github",
		url: "/auth/github",
		authorizationEndpoint: "https://github.com/login/oauth/authorize",
		redirectUri: e,
		optionalUrlParams: ["scope"],
		scope: ["user:email"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 1020,
			height: 618
		}
	},
	instagram: {
		name: "instagram",
		url: "/auth/instagram",
		authorizationEndpoint: "https://api.instagram.com/oauth/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: ["basic"],
		scopeDelimiter: "+",
		oauthType: "2.0",
		popupOptions: {
			width: null,
			height: null
		}
	},
	twitter: {
		name: "twitter",
		url: "/auth/twitter",
		authorizationEndpoint: "https://api.twitter.com/oauth/authenticate",
		redirectUri: e,
		oauthType: "1.0",
		popupOptions: {
			width: 495,
			height: 645
		}
	},
	bitbucket: {
		name: "bitbucket",
		url: "/auth/bitbucket",
		authorizationEndpoint: "https://bitbucket.org/site/oauth2/authorize",
		redirectUri: e + "/",
		optionalUrlParams: ["scope"],
		scope: ["email"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 1020,
			height: 618
		}
	},
	linkedin: {
		name: "linkedin",
		url: "/auth/linkedin",
		authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
		redirectUri: e,
		requiredUrlParams: ["state", "scope"],
		scope: ["r_emailaddress"],
		scopeDelimiter: " ",
		state: "STATE",
		oauthType: "2.0",
		popupOptions: {
			width: 527,
			height: 582
		}
	},
	vkontakte: {
		name: "vkontakte",
		url: "/auth/vkontakte",
		authorizationEndpoint: "https://oauth.vk.com/authorize",
		redirectUri: e + "/",
		requiredUrlParams: ["scope"],
		scope: ["email"],
		scopeDelimiter: ",",
		display: "popup",
		oauthType: "2.0",
		popupOptions: {
			width: 580,
			height: 400
		}
	},
	live: {
		name: "live",
		url: "/auth/live",
		authorizationEndpoint: "https://login.live.com/oauth20_authorize.srf",
		redirectUri: e,
		requiredUrlParams: ["display", "scope"],
		scope: ["wl.emails"],
		scopeDelimiter: " ",
		display: "popup",
		oauthType: "2.0",
		popupOptions: {
			width: 500,
			height: 560
		}
	},
	discord: {
		name: "discord",
		url: "/auth/discord",
		authorizationEndpoint: "https://discord.com/oauth2/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: ["identify", "email"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 500,
			height: 750
		}
	},
	twitch: {
		name: "twitch",
		url: "/auth/twitch",
		authorizationEndpoint: "https://id.twitch.tv/oauth2/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: ["user:read:email"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 500,
			height: 700
		}
	},
	microsoft: {
		name: "microsoft",
		url: "/auth/microsoft",
		authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: [
			"openid",
			"profile",
			"email"
		],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 500,
			height: 600
		}
	},
	gitlab: {
		name: "gitlab",
		url: "/auth/gitlab",
		authorizationEndpoint: "https://gitlab.com/oauth/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: ["read_user"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 1020,
			height: 618
		}
	},
	slack: {
		name: "slack",
		url: "/auth/slack",
		authorizationEndpoint: "https://slack.com/openid/connect/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: [
			"openid",
			"profile",
			"email"
		],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 600,
			height: 700
		}
	},
	spotify: {
		name: "spotify",
		url: "/auth/spotify",
		authorizationEndpoint: "https://accounts.spotify.com/authorize",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: ["user-read-email"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 500,
			height: 700
		}
	},
	reddit: {
		name: "reddit",
		url: "/auth/reddit",
		authorizationEndpoint: "https://www.reddit.com/api/v1/authorize",
		redirectUri: e,
		requiredUrlParams: ["state", "scope"],
		scope: ["identity"],
		scopeDelimiter: " ",
		state: "STATE",
		oauthType: "2.0",
		popupOptions: {
			width: 600,
			height: 700
		}
	},
	dropbox: {
		name: "dropbox",
		url: "/auth/dropbox",
		authorizationEndpoint: "https://www.dropbox.com/oauth2/authorize",
		redirectUri: e,
		oauthType: "2.0",
		popupOptions: {
			width: 600,
			height: 700
		}
	},
	amazon: {
		name: "amazon",
		url: "/auth/amazon",
		authorizationEndpoint: "https://www.amazon.com/ap/oa",
		redirectUri: e,
		requiredUrlParams: ["scope"],
		scope: ["profile"],
		scopeDelimiter: " ",
		oauthType: "2.0",
		popupOptions: {
			width: 600,
			height: 700
		}
	},
	oauth1: {
		name: null,
		url: "/auth/oauth1",
		authorizationEndpoint: null,
		redirectUri: e,
		oauthType: "1.0",
		popupOptions: null
	},
	oauth2: {
		name: null,
		url: "/auth/oauth2",
		clientId: null,
		redirectUri: e,
		authorizationEndpoint: null,
		defaultUrlParams: [
			"response_type",
			"client_id",
			"redirect_uri"
		],
		requiredUrlParams: null,
		optionalUrlParams: null,
		scope: null,
		scopePrefix: null,
		scopeDelimiter: null,
		state: null,
		oauthType: "2.0",
		popupOptions: null,
		responseType: "code",
		responseParams: {
			code: "code",
			clientId: "clientId",
			redirectUri: "redirectUri"
		}
	}
}, n = t.apple, r = t.facebook, i = t.google, a = t.github, o = t.instagram, s = t.twitter, c = t.bitbucket, l = t.linkedin, u = t.vkontakte, d = t.live, f = t.discord, p = t.twitch, m = t.microsoft, h = t.gitlab, g = t.slack, _ = t.spotify, v = t.reddit, y = t.dropbox, b = t.amazon, x = t.oauth1, S = t.oauth2;
export { b as Amazon, n as Apple, c as Bitbucket, f as Discord, y as Dropbox, r as Facebook, a as Github, h as Gitlab, i as Google, o as Instagram, l as Linkedin, d as Live, m as Microsoft, x as Oauth1, S as Oauth2, t as Providers, v as Reddit, g as Slack, _ as Spotify, p as Twitch, s as Twitter, u as Vkontakte };

//# sourceMappingURL=index.mjs.map