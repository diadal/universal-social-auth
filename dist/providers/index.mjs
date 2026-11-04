// src/platform/redirect.ts
var e = /* @__PURE__ */ new Set(["localhost", "127.0.0.1"]), t = /* @__PURE__ */ new Set([
	"javascript:",
	"data:",
	"vbscript:",
	"file:",
	"blob:"
]);
function n(e) {
	try {
		return new URL(e);
	} catch {
		return null;
	}
}
function r(r, i = !1) {
	let a = n(r);
	return !a || t.has(a.protocol) ? !1 : a.protocol === "https:" || a.protocol !== "http:" || i && e.has(a.hostname);
}
// src/providers/platforms.ts
var i = [
	"web",
	"ios",
	"android"
];
// src/providers/schema.ts
function a(e, t, n) {
	if (typeof e != "object" || !e || Array.isArray(e)) n("platforms", "platforms must be an object keyed by web, ios, or android");
	else for (let r of Object.keys(e)) {
		let a = e[r];
		i.includes(r) ? o(r, a, t, n) : n("platforms", `unknown platform "${r}"; use web, ios, or android`);
	}
}
function o(e, t, n, i) {
	if (typeof t != "object" || !t) {
		i(`platforms.${e}`, "platform override must be an object");
		return;
	}
	let { clientId: a, redirectUri: o } = t, s = typeof a == "number" || typeof a == "string" && a.length > 0;
	a !== void 0 && !s && i(`platforms.${e}.clientId`, "clientId must be a non-empty string or a number"), o !== void 0 && (typeof o == "string" ? r(o, n.development === !0) || i(`platforms.${e}.redirectUri`, "redirectUri is not allowed for this platform") : i(`platforms.${e}.redirectUri`, "redirectUri must be a string"));
}
var s = 1;
function c(e) {
	try {
		let t = new URL(e);
		return t.protocol === "https:" || t.protocol === "http:" && (t.hostname === "localhost" || t.hostname === "127.0.0.1");
	} catch {
		return !1;
	}
}
function l(e) {
	let t = Array.isArray(e) ? e : [e];
	if (typeof e != "string" && !Array.isArray(e)) return "scope must be a string or an array of strings";
	for (let e of t) if (typeof e != "string" || e.length === 0 || /\s/.test(e)) return "scope entries must be non-empty strings without whitespace";
	return null;
}
function u(e, t, n = {}) {
	let r = [], i = (t, n) => r.push({
		provider: e,
		field: t,
		message: n
	});
	t.name !== e && i("name", "name must match the provider key"), t.oauthType !== "1.0" && t.oauthType !== "2.0" && i("oauthType", "oauthType must be '1.0' or '2.0'");
	let o = t.authorizationEndpoint;
	if (typeof o == "string" && c(o) || i("authorizationEndpoint", "authorizationEndpoint must be an https URL"), t.redirectUri !== void 0 && typeof t.redirectUri != "string" && i("redirectUri", "redirectUri must be a string"), t.platforms !== void 0 && a(t.platforms, n, i), t.scope !== void 0) {
		let e = l(t.scope);
		e && i("scope", e);
	}
	return t.oauthType !== "1.0" || typeof t.url == "string" && t.url || i("url", "OAuth 1.0 providers need a backend url for the request-token step"), typeof t.responseType == "string" && t.responseType.split(" ").includes("id_token") && t.responseMode !== "form_post" && t.responseMode !== "fragment" && i("responseMode", "responseType 'id_token' requires responseMode 'form_post' or 'fragment'"), r;
}
// src/providers/index.ts
var d = typeof window < "u" ? window.location.origin : "", f = {
	apple: {
		name: "apple",
		url: "",
		authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
		redirectUri: d + "/",
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
		redirectUri: d + "/",
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d + "/",
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
		redirectUri: d,
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
		redirectUri: d + "/",
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
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
		redirectUri: d,
		oauthType: "1.0",
		popupOptions: null
	},
	oauth2: {
		name: null,
		url: "/auth/oauth2",
		clientId: null,
		redirectUri: d,
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
}, p = f.apple, m = f.facebook, h = f.google, g = f.github, _ = f.instagram, v = f.twitter, y = f.bitbucket, b = f.linkedin, x = f.vkontakte, S = f.live, C = f.discord, w = f.twitch, T = f.microsoft, E = f.gitlab, D = f.slack, O = f.spotify, k = f.reddit, A = f.dropbox, j = f.amazon, M = f.oauth1, N = f.oauth2;
export { j as Amazon, p as Apple, y as Bitbucket, C as Discord, A as Dropbox, m as Facebook, g as Github, E as Gitlab, h as Google, _ as Instagram, b as Linkedin, S as Live, T as Microsoft, M as Oauth1, N as Oauth2, s as PROVIDER_SCHEMA_VERSION, f as Providers, k as Reddit, D as Slack, O as Spotify, w as Twitch, v as Twitter, x as Vkontakte, u as validateProviderDefinition };

//# sourceMappingURL=index.mjs.map