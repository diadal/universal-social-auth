// src/options.ts
var e = {
	baseUrl: null,
	tokenName: "token",
	tokenPrefix: "vueauth",
	tokenHeader: "Authorization",
	tokenType: "Bearer",
	loginUrl: "/auth/login",
	registerUrl: "/auth/register",
	logoutUrl: null,
	storageType: "localStorage",
	storageNamespace: "vue3-social-auth",
	cookieStorage: {
		domain: typeof window < "u" ? window.location.hostname : void 0,
		path: "/",
		secure: !1
	},
	requestDataKey: "data",
	responseDataKey: "data",
	bindRequestInterceptor: function(e) {
		let t = e.options.tokenHeader;
		e.$http.interceptors.request.use((e) => (delete e.headers[t], e));
	},
	bindResponseInterceptor: function(e) {
		e.$http.interceptors.response.use((e) => e);
	},
	provider: {}
};
// src/utils.ts
function t(e) {
	return e.replace(/([:\-_]+(.))/g, function(e, t, n, r) {
		return r ? n.toUpperCase() : n;
	});
}
function n(e) {
	return e === void 0;
}
function r(e) {
	return typeof e == "string";
}
function i(e) {
	return e.replace(/\/+/g, "/").replace(/\/\?/g, "?").replace(/\/#/g, "#").replace(/:\//g, "://");
}
function a(e, t) {
	return /^(?:[a-z]+:)?\/\//i.test(t) ? t : i([e, t].join("/"));
}
function o(e) {
	let t = e.protocol === "https:";
	return e.protocol + "//" + e.hostname + ":" + (e.port || (t ? "443" : "80")) + (e.pathname.startsWith("/") ? e.pathname : "/" + e.pathname);
}
function s(e) {
	let t = {}, n, r;
	return (e || "").split("&").forEach((e) => {
		e && (r = e.split("="), n = decodeURIComponent(r[0]), t[n] = !r[1] || decodeURIComponent(r[1]));
	}), t;
}
function c(e) {
	if (e.length === 0) return {};
	let t = {};
	return e.split(";").forEach((e) => {
		let [n, r] = e.trim().split("="), i = decodeURIComponent(n);
		t[i] = decodeURIComponent(r);
	}), t;
}
function l(e) {
	let { path: t, domain: n, expires: r, secure: i } = e, a = r, o = t, s = n;
	return [
		t == null ? "" : ";path=" + o,
		n == null ? "" : ";domain=" + s,
		r == null ? "" : ";expires=" + a.toUTCString(),
		i == null || i === !1 ? "" : ";secure"
	].join("");
}
function u(e, t, n) {
	return [
		encodeURIComponent(e),
		"=",
		encodeURIComponent(t),
		l(n)
	].join("");
}
// src/storage/cookie-storage.ts
var d = class {
	constructor(e) {
		let t = {
			domain: window.location.hostname,
			expires: null,
			path: "/",
			secure: !1
		};
		this._defaultOptions = {
			...t,
			...e
		};
	}
	setItem(e, t) {
		let n = u(e, t, { ...this._defaultOptions });
		this._setCookie(n);
	}
	getItem(e) {
		return c(this._getCookie())[e] ?? null;
	}
	removeItem(e) {
		let t = u(e, "", {
			...this._defaultOptions,
			expires: /* @__PURE__ */ new Date(0)
		});
		this._setCookie(t);
	}
	_getCookie() {
		return typeof document > "u" ? "" : document.cookie ?? "";
	}
	_setCookie(e) {
		document.cookie = e;
	}
}, f = class {
	constructor(e) {
		this.namespace = e ?? null;
	}
	setItem(e, t) {
		window.localStorage.setItem(this._getStorageKey(e), t);
	}
	getItem(e) {
		return window.localStorage.getItem(this._getStorageKey(e));
	}
	removeItem(e) {
		window.localStorage.removeItem(this._getStorageKey(e));
	}
	_getStorageKey(e) {
		return this.namespace ? [this.namespace, e].join(".") : e;
	}
}, ee = class {
	constructor(e) {
		this.namespace = e ?? null, this._storage = {};
	}
	setItem(e, t) {
		this._storage[this._getStorageKey(e)] = t;
	}
	getItem(e) {
		return this._storage[this._getStorageKey(e)];
	}
	removeItem(e) {
		delete this._storage[this._getStorageKey(e)];
	}
	_getStorageKey(e) {
		return this.namespace ? [this.namespace, e].join(".") : e;
	}
}, p = class {
	constructor(e) {
		this.namespace = e ?? null;
	}
	setItem(e, t) {
		window.sessionStorage.setItem(this._getStorageKey(e), t);
	}
	getItem(e) {
		return window.sessionStorage.getItem(this._getStorageKey(e));
	}
	removeItem(e) {
		window.sessionStorage.removeItem(this._getStorageKey(e));
	}
	_getStorageKey(e) {
		return this.namespace ? [this.namespace, e].join(".") : e;
	}
};
// src/storage.ts
function m(e) {
	try {
		let t = e();
		return t.setItem("testKey", "test"), t.removeItem("testKey"), !0;
	} catch {
		return !1;
	}
}
function h(e) {
	switch (e.storageType) {
		case "localStorage": return m(() => window.localStorage) ? new f(e.storageNamespace) : m(() => window.sessionStorage) ? new p(e.storageNamespace) : new d(e.cookieStorage);
		case "sessionStorage": return m(() => window.sessionStorage) ? new p(e.storageNamespace) : new d(e.cookieStorage);
		case "cookieStorage": return new d(e.cookieStorage);
		default: return new ee(e.storageNamespace);
	}
}
// src/errors.ts
var g = class extends Error {
	constructor(e, t) {
		super(t), this.name = "AuthError", this.kind = e;
	}
};
function _(e) {
	return e instanceof g ? e.kind : "unknown";
}
async function v(e) {
	try {
		let t = await e;
		return t instanceof Error ? {
			ok: !1,
			kind: _(t),
			error: t
		} : {
			ok: !0,
			data: t
		};
	} catch (e) {
		return {
			ok: !1,
			kind: _(e),
			error: e instanceof Error ? e : Error(String(e))
		};
	}
}
// src/oauth/popup.ts
var y = class {
	constructor(e, t, n) {
		this.popup = null, this.url = e, this.name = t, this.popupOptions = n;
	}
	open(e, t, n) {
		try {
			return this.popup = window.open(this.url, this.name, this._stringifyOptions()), this.popup ? (this.popup.focus && this.popup.focus(), t ? Promise.resolve() : this.pooling(e, n)) : Promise.reject(new g("popup_blocked", "Auth popup was blocked by the browser"));
		} catch {
			return Promise.reject(new g("unknown", "OAuth popup error occurred"));
		}
	}
	pooling(e, t) {
		return new Promise((n, r) => {
			let i = document.createElement("a");
			i.href = e;
			let a = o(i), c = t ? Date.now() + t : 0, l = setInterval(() => {
				if (!this.popup || this.popup.closed || this.popup.closed === void 0) clearInterval(l), l = 0, r(new g("cancelled", "Auth popup window closed"));
				else if (c && Date.now() > c) clearInterval(l), l = 0, this.popup.close(), r(new g("timeout", "Auth popup timed out"));
				else try {
					let e = this.popup;
					if (o(e.location) === a) {
						if (e.location.search || e.location.hash) {
							let t = s(e.location.search.substring(1)), i = s(e.location.hash.substring(1)), a = {
								...t,
								...i
							};
							clearInterval(l), l = 0, e.close(), a.error ? r(a.error === "access_denied" ? new g("cancelled", "Authorization was denied") : new g("provider", "OAuth provider returned an error")) : n(a);
						} else clearInterval(l), l = 0, e.close(), r(new g("provider", "OAuth redirect has occurred but no query or hash parameters were found."));
					}
				} catch {}
			}, 250);
		});
	}
	_stringifyOptions() {
		let e = [], t = this.popupOptions;
		for (let r in t) n(t[r]) || e.push(`${r}=${t[r]}`);
		return e.join(",");
	}
}, b = {
	name: null,
	url: null,
	authorizationEndpoint: null,
	scope: null,
	scopePrefix: null,
	scopeDelimiter: null,
	redirectUri: null,
	requiredUrlParams: null,
	defaultUrlParams: null,
	oauthType: "1.0",
	popupOptions: void 0
}, x = class {
	constructor(e, t, n, r) {
		this.$http = e, this.storage = t, this.providerConfig = {
			...b,
			...n
		}, this.options = r;
	}
	async init(e) {
		return this.oauthPopup = new y("about:blank", this.providerConfig.name, this.providerConfig.popupOptions), this.oauthPopup.open(this.providerConfig.redirectUri, !0), this.getRequestToken().then(async (t) => {
			let n = this.openPopup(t);
			return this.exchangeForToken(n, e);
		});
	}
	async getRequestToken() {
		let e = {};
		e.method = "POST";
		let t = this.options.requestDataKey;
		return e[t] = { ...this.providerConfig }, e.withCredentials = this.options.withCredentials, e.url = this.options.baseUrl ? a(this.options.baseUrl, this.providerConfig.url) : this.providerConfig.url, this.$http(e);
	}
	openPopup(e) {
		let t = e[this.options.responseDataKey], n = [this.providerConfig.authorizationEndpoint, this.buildQueryString(t)].join("?"), r = this.oauthPopup;
		return r.popup ? (r.popup.location.href = n, this.providerConfig.skipPooling ? Promise.resolve() : r.pooling(this.providerConfig.redirectUri)) : Promise.reject(/* @__PURE__ */ Error("OAuth popup error occurred"));
	}
	exchangeForToken(e, t) {
		let n = {
			...t,
			...e
		}, r = {};
		r.method = "POST";
		let i = this.options.requestDataKey;
		return r[i] = n, r.withCredentials = this.options.withCredentials, r.url = this.options.baseUrl ? a(this.options.baseUrl, this.providerConfig.url) : this.providerConfig.url, this.$http(r);
	}
	buildQueryString(e) {
		let t = [];
		for (let n in e) {
			let r = e[n];
			t.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
		}
		return t.join("&");
	}
};
// src/pkce.ts
function S(e) {
	let t = "";
	return e.forEach((e) => {
		t += String.fromCharCode(e);
	}), btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function C() {
	if (globalThis.crypto === void 0 || !globalThis.crypto.subtle) throw Error("Web Crypto (crypto.subtle) is required for PKCE");
	return globalThis.crypto;
}
function w(e = 32) {
	let t = new Uint8Array(e);
	return C().getRandomValues(t), S(t);
}
function T() {
	return w(64);
}
async function E(e) {
	let t = await C().subtle.digest("SHA-256", new TextEncoder().encode(e));
	return S(new Uint8Array(t));
}
// src/oidc.ts
function D(e) {
	return e.replace(/\/+$/, "");
}
function O(e, t) {
	if (typeof e != "string") throw new g("config", `OIDC ${t} is missing`);
	let n = new URL(e), r = n.hostname === "localhost" || n.hostname === "127.0.0.1";
	if (n.protocol !== "https:" && !(n.protocol === "http:" && r)) throw new g("config", `OIDC ${t} must use https`);
	return e;
}
async function k(e, t) {
	let n = D(O(e, "issuer")), r = (await t.get(`${n}/.well-known/openid-configuration`)).data;
	if (!r || typeof r != "object") throw new g("config", "OIDC discovery document is invalid");
	if (typeof r.issuer != "string" || D(r.issuer) !== n) throw new g("invalid_token", "OIDC discovery issuer does not match");
	return O(r.authorization_endpoint, "authorization_endpoint"), r;
}
function A(e, t) {
	if (D(typeof e.iss == "string" ? e.iss : "") !== D(t.issuer)) throw new g("invalid_token", "ID token issuer mismatch");
	let n = Array.isArray(e.aud) ? e.aud : [e.aud];
	if (n.indexOf(t.audience) === -1) throw new g("invalid_token", "ID token audience mismatch");
	if (n.length > 1 && e.azp !== t.audience) throw new g("invalid_token", "ID token authorized party mismatch");
	let r = t.now ?? Math.floor(Date.now() / 1e3), i = t.clockSkewSeconds ?? 60;
	if (typeof e.exp != "number" || e.exp + i < r) throw new g("invalid_token", "ID token has expired");
	if (t.nonce !== void 0 && e.nonce !== t.nonce) throw new g("invalid_token", "ID token nonce mismatch");
}
// src/oauth/oauth2.ts
var j = {
	name: null,
	url: null,
	clientId: null,
	authorizationEndpoint: null,
	redirectUri: null,
	scope: null,
	scopePrefix: null,
	scopeDelimiter: null,
	state: null,
	requiredUrlParams: null,
	defaultUrlParams: [
		"response_type",
		"client_id",
		"redirect_uri"
	],
	responseType: "code",
	responseParams: {
		code: "code",
		clientId: "clientId",
		redirectUri: "redirectUri"
	},
	oauthType: "2.0",
	popupOptions: {}
}, M = class {
	constructor(e, t, n, r) {
		this.$http = e, this.storage = t, this.providerConfig = {
			...j,
			...n
		}, this.options = r;
	}
	async init() {
		let e = this.providerConfig.name + "_state", t = this.providerConfig.state, n = this.providerConfig.state;
		typeof t == "function" ? this.storage.setItem(e, t()) : r(n) && this.storage.setItem(e, n);
		let i = this.providerConfig, a = {}, o = Array.isArray(i.optionalUrlParams) ? [...i.optionalUrlParams] : [];
		if (typeof i.issuer == "string" && i.issuer && (i.authorizationEndpoint = (await k(i.issuer, this.$http)).authorization_endpoint), i.pkce) {
			let e = T();
			this.storage.setItem(i.name + "_pkce_verifier", e), i.codeChallenge = await E(e), i.codeChallengeMethod = "S256", a.codeVerifier = e, o.push("code_challenge", "code_challenge_method");
		}
		if (i.oidc) {
			let e = w(16);
			this.storage.setItem(i.name + "_nonce", e), i.nonce = e, a.nonce = e, o.push("nonce");
		}
		o.length && (i.optionalUrlParams = o);
		let s = [i.authorizationEndpoint, this._stringifyRequestParams()].join("?");
		this.oauthPopup = new y(s, i.name, i.popupOptions);
		let c = this.oauthPopup, l = typeof i.callbackTimeout == "number" ? i.callbackTimeout : void 0, u = await c.open(i.redirectUri, i.skipPooling, l);
		if (u) {
			if (i.state) {
				let e = this.storage.getItem(i.name + "_state");
				if (!e || u.state !== e) throw new g("state_mismatch", "OAuth state mismatch");
			}
			return {
				...u,
				...a
			};
		}
	}
	_stringifyRequestParams() {
		let e = [];
		return [
			"defaultUrlParams",
			"requiredUrlParams",
			"optionalUrlParams"
		].forEach((n) => {
			this.providerConfig[n] && Array.isArray(this.providerConfig[n]) && this.providerConfig[n].forEach((n) => {
				let r = t(n), i = this.providerConfig[n], a = typeof i == "function" ? i() : this.providerConfig[r];
				if (n !== "redirect_uri" || a) {
					if (n === "state") {
						let e = this.providerConfig.name + "_state";
						a = encodeURIComponent(this.storage.getItem(e));
					}
					n === "scope" && Array.isArray(a) && (a = a.join(this.providerConfig.scopeDelimiter), this.providerConfig.scopePrefix && (a = [this.providerConfig.scopePrefix, a].join(this.providerConfig.scopeDelimiter))), e.push([n, a]);
				}
			});
		}), e.map((e) => e.join("=")).join("&");
	}
};
// src/lifecycle.ts
function N(e, t, n) {
	let r = e?.[t];
	if (typeof r == "function") try {
		r(n);
	} catch {}
}
// src/authenticate.ts
function P(e, t) {
	let n = e.use;
	return {
		use: (...r) => {
			let i = n.apply(e, r);
			return t.push(i), i;
		},
		eject: (t) => e.eject(t),
		clear: () => e.clear()
	};
}
var F = class {
	constructor(t, n) {
		this.interceptorIds = {
			request: [],
			response: []
		}, Object.defineProperties(this, {
			$http: { get() {
				return t;
			} },
			OverrideOptions: { get() {
				return n;
			} },
			defaultOptions: { get() {
				return e;
			} }
		});
	}
	ejectInterceptors() {
		let e = this.$http;
		this.interceptorIds.request.forEach((t) => e.interceptors.request.eject(t)), this.interceptorIds.response.forEach((t) => e.interceptors.response.eject(t)), this.interceptorIds = {
			request: [],
			response: []
		};
	}
	async authenticate(e, t, n = {}) {
		let r = (this.OverrideOptions?.providers ?? {})[e], i = { provider: {
			...t,
			...r
		} }, a = {
			...this.defaultOptions,
			...i
		};
		this.options = a, this.storage = h(a);
		let o = a, s = o.provider, c = s;
		if (o.bindRequestInterceptor && typeof o.bindRequestInterceptor == "function" && o.bindResponseInterceptor && typeof o.bindResponseInterceptor == "function") {
			this.ejectInterceptors();
			let e = this.$http, t = Object.assign(Object.create(e), { interceptors: {
				request: P(e.interceptors.request, this.interceptorIds.request),
				response: P(e.interceptors.response, this.interceptorIds.response)
			} }), n = {
				options: this.options,
				storage: this.storage,
				$http: t,
				providerConfig: s
			};
			o.bindRequestInterceptor.call(this, n), o.bindResponseInterceptor.call(this, n);
		} else throw Error("Both request and response interceptors must be functions");
		if (!s) throw Error("Unknown provider");
		let l = this.OverrideOptions ?? {}, u = l.hooks;
		s.callbackTimeout === void 0 && typeof l.callbackTimeout == "number" && (s.callbackTimeout = l.callbackTimeout);
		try {
			let t;
			switch (c.oauthType) {
				case "1.0":
					t = new x(this.$http, this.storage, s, a);
					break;
				case "2.0":
					t = new M(this.$http, this.storage, s, a);
					break;
				default: throw new g("config", "Invalid OAuth type");
			}
			N(u, "onStart", { provider: e });
			try {
				let r = await t.init(n);
				return N(u, "onComplete", { provider: e }), r;
			} catch (t) {
				let n = t instanceof Error ? t : Error(String(t)), r = _(n);
				return r === "cancelled" ? N(u, "onCancel", { provider: e }) : N(u, "onError", {
					provider: e,
					kind: r
				}), n;
			}
		} catch (e) {
			return e;
		}
	}
}, I = 1;
function L(e) {
	try {
		let t = new URL(e);
		return t.protocol === "https:" || t.protocol === "http:" && (t.hostname === "localhost" || t.hostname === "127.0.0.1");
	} catch {
		return !1;
	}
}
function R(e) {
	let t = Array.isArray(e) ? e : [e];
	if (typeof e != "string" && !Array.isArray(e)) return "scope must be a string or an array of strings";
	for (let e of t) if (typeof e != "string" || e.length === 0 || /\s/.test(e)) return "scope entries must be non-empty strings without whitespace";
	return null;
}
function z(e, t) {
	let n = [], r = (t, r) => n.push({
		provider: e,
		field: t,
		message: r
	});
	t.name !== e && r("name", "name must match the provider key"), t.oauthType !== "1.0" && t.oauthType !== "2.0" && r("oauthType", "oauthType must be '1.0' or '2.0'");
	let i = t.authorizationEndpoint;
	if (typeof i == "string" && L(i) || r("authorizationEndpoint", "authorizationEndpoint must be an https URL"), t.redirectUri !== void 0 && typeof t.redirectUri != "string" && r("redirectUri", "redirectUri must be a string"), t.scope !== void 0) {
		let e = R(t.scope);
		e && r("scope", e);
	}
	return n;
}
// src/providers/index.ts
var B = typeof window < "u" ? window.location.origin : "", V = {
	apple: {
		name: "apple",
		url: "",
		authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
		redirectUri: B + "/",
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
		redirectUri: B + "/",
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B + "/",
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
		redirectUri: B,
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
		redirectUri: B + "/",
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
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
		redirectUri: B,
		oauthType: "1.0",
		popupOptions: null
	},
	oauth2: {
		name: null,
		url: "/auth/oauth2",
		clientId: null,
		redirectUri: B,
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
}, H = V.apple, U = V.facebook, W = V.google, G = V.github, te = V.instagram, K = V.twitter, q = V.bitbucket, J = V.linkedin, Y = V.vkontakte, X = V.live, Z = V.discord, Q = V.twitch, ne = V.microsoft, re = V.gitlab, ie = V.slack, ae = V.spotify, oe = V.reddit, $ = V.dropbox, se = V.amazon, ce = V.oauth1, le = V.oauth2, ue = F;
export { se as Amazon, H as Apple, g as AuthError, q as Bitbucket, Z as Discord, $ as Dropbox, U as Facebook, G as Github, re as Gitlab, W as Google, te as Instagram, J as Linkedin, X as Live, ne as Microsoft, ce as Oauth1, le as Oauth2, I as PROVIDER_SCHEMA_VERSION, V as Providers, oe as Reddit, ie as Slack, ae as Spotify, Q as Twitch, K as Twitter, F as UniversalSocialauth, Y as Vkontakte, _ as classifyError, E as createCodeChallenge, T as createCodeVerifier, ue as default, k as discoverOidc, v as toOutcome, A as validateIdTokenClaims, z as validateProviderDefinition };

//# sourceMappingURL=index.mjs.map