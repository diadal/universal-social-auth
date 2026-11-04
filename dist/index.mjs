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
}, ee = class {
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
}, f = class {
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
		case "localStorage": return m(() => window.localStorage) ? new ee(e.storageNamespace) : m(() => window.sessionStorage) ? new p(e.storageNamespace) : new d(e.cookieStorage);
		case "sessionStorage": return m(() => window.sessionStorage) ? new p(e.storageNamespace) : new d(e.cookieStorage);
		case "cookieStorage": return new d(e.cookieStorage);
		default: return new f(e.storageNamespace);
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
function y(e) {
	if (!e.search && !e.hash) return new g("provider", "OAuth redirect has occurred but no query or hash parameters were found.");
	let t = {
		...s(e.search.substring(1)),
		...s(e.hash.substring(1))
	};
	return t.error ? t.error === "access_denied" ? new g("cancelled", "Authorization was denied") : new g("provider", "OAuth provider returned an error") : t;
}
var b = class {
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
			let a = o(i), s = t ? Date.now() + t : 0, c = 0, l = (e) => {
				window.clearInterval(c), c = 0, e instanceof g ? r(e) : n(e);
			};
			c = window.setInterval(() => {
				let e = this.popup;
				if (!e || e.closed || e.closed === void 0) l(new g("cancelled", "Auth popup window closed"));
				else if (s && Date.now() > s) e.close(), l(new g("timeout", "Auth popup timed out"));
				else try {
					if (o(e.location) !== a) return;
					let t = y(e.location);
					e.close(), l(t);
				} catch {}
			}, 250);
		});
	}
	_stringifyOptions() {
		let e = [], t = this.popupOptions;
		for (let r in t) n(t[r]) || e.push(`${r}=${t[r]}`);
		return e.join(",");
	}
}, x = class {
	constructor(e, t, n) {
		this.popup = new b(e, t, n);
	}
	open(e, t, n) {
		return this.popup.open(e, t, n);
	}
	navigate(e) {
		let t = this.popup.popup;
		return t ? (t.location.href = e, Promise.resolve(!0)) : Promise.resolve(!1);
	}
	waitForCallback(e, t) {
		return this.popup.pooling(e, t);
	}
	close() {
		this.popup.popup?.close();
	}
}, S = {
	kind: "web",
	platform: "web",
	createSession: (e, t, n) => new x(e, t, n)
}, C = S;
function te(e) {
	C = e;
}
function w() {
	return C;
}
// src/oauth/oauth1.ts
var ne = {
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
}, re = class {
	constructor(e, t, n, r) {
		this.$http = e, this.storage = t, this.providerConfig = {
			...ne,
			...n
		}, this.options = r;
	}
	async init(e) {
		return this.oauthPopup = w().createSession("about:blank", this.providerConfig.name, this.providerConfig.popupOptions), this.oauthPopup.open(this.providerConfig.redirectUri, !0), this.getRequestToken().then(async (t) => {
			let n = await this.openPopup(t);
			if (n) return this.exchangeForToken(n, e);
		});
	}
	async getRequestToken() {
		let e = {};
		e.method = "POST";
		let t = this.options.requestDataKey;
		return e[t] = { ...this.providerConfig }, e.withCredentials = this.options.withCredentials, e.url = this.options.baseUrl ? a(this.options.baseUrl, this.providerConfig.url) : this.providerConfig.url, this.$http(e);
	}
	async openPopup(e) {
		let t = e[this.options.responseDataKey], n = w().native;
		if (n) return this.openNative(t, n);
		let r = [this.providerConfig.authorizationEndpoint, this.buildQueryString(t)].join("?"), i = this.oauthPopup;
		if (!await i.navigate(r)) throw Error("OAuth popup error occurred");
		if (!this.providerConfig.skipPooling) return i.waitForCallback(this.providerConfig.redirectUri);
	}
	async openNative(e, t) {
		let { oauth_token_secret: n, ...r } = e, i = typeof e.oauth_token == "string" ? e.oauth_token : "";
		if (!i) throw new g("invalid_token", "OAuth request token is missing");
		let a = [this.providerConfig.authorizationEndpoint, this.buildQueryString(r)].join("?");
		await t.transactions.save(i, {
			provider: this.providerConfig.name ?? "",
			oauth1RequestTokenSecret: typeof n == "string" ? n : ""
		});
		let o = this.oauthPopup;
		if (!await o.navigate(a)) throw await t.transactions.discard(i), Error("OAuth popup error occurred");
		if (this.providerConfig.skipPooling) return;
		let s;
		try {
			s = await o.waitForCallback(this.providerConfig.redirectUri, void 0, void 0, i);
		} catch (e) {
			throw await t.transactions.discard(i), e;
		}
		let c = await t.transactions.consume(typeof s.oauth_token == "string" ? s.oauth_token : i);
		if (!c) throw new g("state_mismatch", "OAuth request token mismatch");
		return {
			...s,
			oauth_token_secret: c.oauth1RequestTokenSecret
		};
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
function T(e) {
	let t = "";
	return e.forEach((e) => {
		t += String.fromCodePoint(e);
	}), btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function E() {
	if (!globalThis.crypto?.subtle) throw Error("Web Crypto (crypto.subtle) is required for PKCE");
	return globalThis.crypto;
}
function D(e = 32) {
	let t = new Uint8Array(e);
	return E().getRandomValues(t), T(t);
}
function O() {
	return D(64);
}
async function k(e) {
	let t = await E().subtle.digest("SHA-256", new TextEncoder().encode(e));
	return T(new Uint8Array(t));
}
// src/oidc.ts
function A(e) {
	let t = e.length;
	for (; t > 0 && e.charAt(t - 1) === "/";) t--;
	return e.slice(0, t);
}
function j(e, t) {
	if (typeof e != "string") throw new g("config", `OIDC ${t} is missing`);
	let n = new URL(e), r = n.hostname === "localhost" || n.hostname === "127.0.0.1";
	if (n.protocol !== "https:" && !(n.protocol === "http:" && r)) throw new g("config", `OIDC ${t} must use https`);
	return e;
}
async function M(e, t) {
	let n = A(j(e, "issuer")), r = (await t.get(`${n}/.well-known/openid-configuration`)).data;
	if (!r || typeof r != "object") throw new g("config", "OIDC discovery document is invalid");
	if (typeof r.issuer != "string" || A(r.issuer) !== n) throw new g("invalid_token", "OIDC discovery issuer does not match");
	return j(r.authorization_endpoint, "authorization_endpoint"), r;
}
function N(e, t) {
	if (A(typeof e.iss == "string" ? e.iss : "") !== A(t.issuer)) throw new g("invalid_token", "ID token issuer mismatch");
	let n = Array.isArray(e.aud) ? e.aud : [e.aud];
	if (!n.includes(t.audience)) throw new g("invalid_token", "ID token audience mismatch");
	if (n.length > 1 && e.azp !== t.audience) throw new g("invalid_token", "ID token authorized party mismatch");
	let r = t.now ?? Math.floor(Date.now() / 1e3), i = t.clockSkewSeconds ?? 60;
	if (typeof e.exp != "number" || e.exp + i < r) throw new g("invalid_token", "ID token has expired");
	if (t.nonce !== void 0 && e.nonce !== t.nonce) throw new g("invalid_token", "ID token nonce mismatch");
}
// src/oauth/oauth2.ts
function ie(e, t) {
	return !t || /[?&]state=/.test(e) ? e : `${e}${e.includes("?") ? "&" : "?"}state=${encodeURIComponent(t)}`;
}
var ae = {
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
}, P = class {
	constructor(e, t, n, r) {
		this.$http = e, this.storage = t, this.providerConfig = {
			...ae,
			...n
		}, this.options = r;
	}
	async init() {
		let e = w();
		this.resolveTransactionState(e.kind === "native");
		let t = this.providerConfig, n = {}, r = Array.isArray(t.optionalUrlParams) ? [...t.optionalUrlParams] : [];
		typeof t.issuer == "string" && t.issuer && (t.authorizationEndpoint = (await M(t.issuer, this.$http)).authorization_endpoint), await this.addPkceAndNonce(n, r), r.length && (t.optionalUrlParams = r);
		let i = typeof t.callbackTimeout == "number" ? t.callbackTimeout : void 0, a = [t.authorizationEndpoint, this._stringifyRequestParams()].join("?");
		if (e.kind === "native" && e.native) return this.initNative(e, ie(a, this.transactionState), n, i);
		let o = S.createSession(a, t.name, t.popupOptions);
		this.oauthPopup = o;
		let s = await o.open(t.redirectUri, t.skipPooling, i);
		if (s) return this.assertState(s), {
			...s,
			...n
		};
	}
	resolveTransactionState(e) {
		let t = this.providerConfig.state, n = this.providerConfig.state;
		typeof t == "function" ? this.transactionState = t() : r(n) && (this.transactionState = n), e && !this.transactionState && (this.transactionState = D(32));
	}
	async addPkceAndNonce(e, t) {
		let n = this.providerConfig;
		if (n.pkce) {
			let r = O();
			n.codeChallenge = await k(r), n.codeChallengeMethod = "S256", e.codeVerifier = r, t.push("code_challenge", "code_challenge_method");
		}
		if (n.oidc) {
			let r = D(16);
			n.nonce = r, e.nonce = r, t.push("nonce");
		}
	}
	assertState(e) {
		if (!this.providerConfig.state) return;
		let t = this.transactionState;
		if (!t || e.state !== t) throw new g("state_mismatch", "OAuth state mismatch");
	}
	async initNative(e, t, n, r) {
		let i = this.providerConfig, a = e.native, o = this.transactionState;
		await a.transactions.save(o, {
			provider: i.name,
			codeVerifier: n.codeVerifier,
			nonce: n.nonce
		});
		let s = e.createSession(t, i.name, i.popupOptions);
		this.oauthPopup = s;
		let c;
		try {
			c = await s.open(i.redirectUri, i.skipPooling, r, o, i.responseMode);
		} catch (e) {
			throw await a.transactions.discard(o), e;
		}
		if (!c) return;
		let l = await a.transactions.consume(o);
		if (l?.provider !== i.name || !l) throw new g("state_mismatch", "OAuth state mismatch");
		return {
			...c,
			...l.codeVerifier !== void 0 && { codeVerifier: l.codeVerifier },
			...l.nonce !== void 0 && { nonce: l.nonce }
		};
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
				(n !== "redirect_uri" || a) && (n === "state" && (a = encodeURIComponent(this.transactionState ?? "")), n === "scope" && Array.isArray(a) && (a = a.join(this.providerConfig.scopeDelimiter), this.providerConfig.scopePrefix && (a = [this.providerConfig.scopePrefix, a].join(this.providerConfig.scopeDelimiter))), e.push([n, a]));
			});
		}), e.map((e) => e.join("=")).join("&");
	}
};
// src/lifecycle.ts
function F(e, t, n) {
	let r = e?.[t];
	if (typeof r == "function") try {
		r(n);
	} catch {}
}
// src/providers/platforms.ts
var I = [
	"web",
	"ios",
	"android"
];
function L(e, t) {
	let n = e.platforms?.[t];
	if (!n) return e;
	let r = { ...e };
	return n.clientId !== void 0 && (r.clientId = n.clientId), n.redirectUri !== void 0 && (r.redirectUri = n.redirectUri), r;
}
// src/authenticate.ts
function R(e, t) {
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
var z = class {
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
				request: R(e.interceptors.request, this.interceptorIds.request),
				response: R(e.interceptors.response, this.interceptorIds.response)
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
		let d = L(s, w().platform);
		try {
			let t;
			switch (c.oauthType) {
				case "1.0":
					t = new re(this.$http, this.storage, d, a);
					break;
				case "2.0":
					t = new P(this.$http, this.storage, d, a);
					break;
				default: throw new g("config", "Invalid OAuth type");
			}
			F(u, "onStart", { provider: e });
			try {
				let r = await t.init(n);
				return F(u, "onComplete", { provider: e }), r;
			} catch (t) {
				let n = t instanceof Error ? t : Error(String(t)), r = _(n);
				return r === "cancelled" ? F(u, "onCancel", { provider: e }) : F(u, "onError", {
					provider: e,
					kind: r
				}), n;
			}
		} catch (e) {
			return e;
		}
	}
}, B = /* @__PURE__ */ new Set(["localhost", "127.0.0.1"]), V = /* @__PURE__ */ new Set([
	"javascript:",
	"data:",
	"vbscript:",
	"file:",
	"blob:"
]);
function H(e) {
	try {
		return new URL(e);
	} catch {
		return null;
	}
}
function U(e, t = !1) {
	let n = H(e);
	return !n || V.has(n.protocol) ? !1 : n.protocol === "https:" || n.protocol !== "http:" || t && B.has(n.hostname);
}
function W(e, t) {
	let n = H(e), r = H(t);
	return !n || !r ? !1 : n.protocol === r.protocol && n.host.toLowerCase() === r.host.toLowerCase() && n.pathname === r.pathname;
}
function G(e) {
	return e === void 0 ? /* @__PURE__ */ new Set(["query"]) : new Set(typeof e == "string" ? [e] : e);
}
function K(e) {
	let t = {};
	return e.forEach((e, n) => {
		t[n] = e;
	}), t;
}
function q(e, t) {
	return {
		ok: !1,
		error: new g(e, t)
	};
}
function J(e, t) {
	if (!U(t.redirectUri, t.development)) return q("config", "Redirect URI is not allowed for this build");
	if (!W(e, t.redirectUri)) return q("provider", "Callback URL does not match the redirect URI");
	let n = new URL(e), r = G(t.responseMode), i = n.hash.length > 1, a = n.search.length > 1, o = r.has("query") || r.has("form_post");
	if (i && !r.has("fragment") || a && !o) return q("provider", "Callback used a response mode the provider does not declare");
	let s = {
		...o ? K(n.searchParams) : {},
		...r.has("fragment") ? K(new URLSearchParams(n.hash.slice(1))) : {}
	};
	return Object.keys(s).length === 0 ? q("provider", "OAuth redirect has occurred but no query or hash parameters were found.") : t.expectedState !== void 0 && s.state !== t.expectedState ? q("state_mismatch", "OAuth state mismatch") : s.error ? s.error === "access_denied" ? q("cancelled", "Authorization was denied") : q("provider", "OAuth provider returned an error") : {
		ok: !0,
		params: s
	};
}
// src/providers/schema.ts
function oe(e, t, n) {
	if (typeof e != "object" || !e || Array.isArray(e)) n("platforms", "platforms must be an object keyed by web, ios, or android");
	else for (let r of Object.keys(e)) {
		let i = e[r];
		I.includes(r) ? se(r, i, t, n) : n("platforms", `unknown platform "${r}"; use web, ios, or android`);
	}
}
function se(e, t, n, r) {
	if (typeof t != "object" || !t) {
		r(`platforms.${e}`, "platform override must be an object");
		return;
	}
	let { clientId: i, redirectUri: a } = t, o = typeof i == "number" || typeof i == "string" && i.length > 0;
	i !== void 0 && !o && r(`platforms.${e}.clientId`, "clientId must be a non-empty string or a number"), a !== void 0 && (typeof a == "string" ? U(a, n.development === !0) || r(`platforms.${e}.redirectUri`, "redirectUri is not allowed for this platform") : r(`platforms.${e}.redirectUri`, "redirectUri must be a string"));
}
var ce = 1;
function le(e) {
	try {
		let t = new URL(e);
		return t.protocol === "https:" || t.protocol === "http:" && (t.hostname === "localhost" || t.hostname === "127.0.0.1");
	} catch {
		return !1;
	}
}
function ue(e) {
	let t = Array.isArray(e) ? e : [e];
	if (typeof e != "string" && !Array.isArray(e)) return "scope must be a string or an array of strings";
	for (let e of t) if (typeof e != "string" || e.length === 0 || /\s/.test(e)) return "scope entries must be non-empty strings without whitespace";
	return null;
}
function de(e, t, n = {}) {
	let r = [], i = (t, n) => r.push({
		provider: e,
		field: t,
		message: n
	});
	t.name !== e && i("name", "name must match the provider key"), t.oauthType !== "1.0" && t.oauthType !== "2.0" && i("oauthType", "oauthType must be '1.0' or '2.0'");
	let a = t.authorizationEndpoint;
	if (typeof a == "string" && le(a) || i("authorizationEndpoint", "authorizationEndpoint must be an https URL"), t.redirectUri !== void 0 && typeof t.redirectUri != "string" && i("redirectUri", "redirectUri must be a string"), t.platforms !== void 0 && oe(t.platforms, n, i), t.scope !== void 0) {
		let e = ue(t.scope);
		e && i("scope", e);
	}
	return t.oauthType !== "1.0" || typeof t.url == "string" && t.url || i("url", "OAuth 1.0 providers need a backend url for the request-token step"), typeof t.responseType == "string" && t.responseType.split(" ").includes("id_token") && t.responseMode !== "form_post" && t.responseMode !== "fragment" && i("responseMode", "responseType 'id_token' requires responseMode 'form_post' or 'fragment'"), r;
}
// src/providers/index.ts
var Y = typeof window < "u" ? window.location.origin : "", X = {
	apple: {
		name: "apple",
		url: "",
		authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
		redirectUri: Y + "/",
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
		redirectUri: Y + "/",
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y + "/",
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
		redirectUri: Y,
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
		redirectUri: Y + "/",
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
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
		redirectUri: Y,
		oauthType: "1.0",
		popupOptions: null
	},
	oauth2: {
		name: null,
		url: "/auth/oauth2",
		clientId: null,
		redirectUri: Y,
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
}, Z = X.apple, fe = X.facebook, pe = X.google, me = X.github, he = X.instagram, ge = X.twitter, _e = X.bitbucket, ve = X.linkedin, ye = X.vkontakte, be = X.live, xe = X.discord, Se = X.twitch, Ce = X.microsoft, we = X.gitlab, Te = X.slack, Ee = X.spotify, De = X.reddit, Oe = X.dropbox, ke = X.amazon, Ae = X.oauth1, je = X.oauth2;
// src/platform/resume.ts
async function Me(e, t, n) {
	let r = J(e, {
		redirectUri: n,
		development: t.development
	});
	if (!r.ok) throw r.error;
	let i = Ne(r.params), a = i ? await t.transactions.consume(i) : void 0;
	if (!a) throw new g("state_mismatch", "No pending sign-in matches this callback");
	return {
		provider: a.provider,
		params: Pe(r.params, a)
	};
}
function Ne(e) {
	if (typeof e.state == "string") return e.state;
	if (typeof e.oauth_token == "string") return e.oauth_token;
}
function Pe(e, t) {
	let n = { ...e };
	return t.codeVerifier !== void 0 && (n.codeVerifier = t.codeVerifier), t.nonce !== void 0 && (n.nonce = t.nonce), t.oauth1RequestTokenSecret !== void 0 && (n.oauth_token_secret = t.oauth1RequestTokenSecret), n;
}
// src/platform/transaction-store.ts
var Fe = 6e5, Q = "usa.tx.", $ = "usa.tx.index", Ie = class {
	constructor(e, t = Fe, n = () => Date.now()) {
		this.kv = e, this.ttlMs = t, this.now = n, this.queue = Promise.resolve();
	}
	save(e, t) {
		return this.run(async () => {
			await this.purgeExpired();
			let n = await this.readIndex();
			if (n.includes(e)) throw new g("state_mismatch", "OAuth state mismatch");
			let r = {
				...t,
				createdAt: this.now()
			};
			await this.kv.set(Q + e, JSON.stringify(r)), n.push(e), await this.writeIndex(n);
		});
	}
	consume(e) {
		return this.run(async () => {
			await this.purgeExpired();
			let t = await this.readRecord(e);
			if (await this.delete(e), t && !this.isExpired(t)) return t;
		});
	}
	discard(e) {
		return this.run(() => this.delete(e));
	}
	run(e) {
		let t = this.queue.then(e, e);
		return this.queue = t.catch(() => void 0), t;
	}
	isExpired(e) {
		return this.now() - e.createdAt >= this.ttlMs;
	}
	async readRecord(e) {
		let t = await this.kv.get(Q + e);
		if (t) try {
			return JSON.parse(t);
		} catch {
			return;
		}
	}
	async delete(e) {
		await this.kv.remove(Q + e);
		let t = await this.readIndex();
		t.includes(e) && await this.writeIndex(t.filter((t) => t !== e));
	}
	async purgeExpired() {
		let e = await this.readIndex(), t = await Promise.all(e.map((e) => this.readRecord(e))), n = e.filter((e, n) => {
			let r = t[n];
			return !r || this.isExpired(r);
		});
		n.length !== 0 && (await Promise.all(n.map((e) => this.kv.remove(Q + e))), await this.writeIndex(e.filter((e) => !n.includes(e))));
	}
	async readIndex() {
		let e = await this.kv.get($);
		if (!e) return [];
		try {
			let t = JSON.parse(e);
			return Array.isArray(t) ? t.filter((e) => typeof e == "string") : [];
		} catch {
			return [];
		}
	}
	async writeIndex(e) {
		e.length === 0 ? await this.kv.remove($) : await this.kv.set($, JSON.stringify(e));
	}
}, Le = z;
export { ke as Amazon, Z as Apple, g as AuthError, _e as Bitbucket, xe as Discord, Oe as Dropbox, fe as Facebook, me as Github, we as Gitlab, pe as Google, he as Instagram, ve as Linkedin, be as Live, Ce as Microsoft, Ae as Oauth1, je as Oauth2, ce as PROVIDER_SCHEMA_VERSION, X as Providers, De as Reddit, Te as Slack, Ee as Spotify, Ie as TransactionStore, Se as Twitch, ge as Twitter, z as UniversalSocialauth, ye as Vkontakte, _ as classifyError, k as createCodeChallenge, O as createCodeVerifier, Le as default, M as discoverOidc, U as isAllowedRedirectUri, Me as resumePendingSignIn, te as setPlatform, v as toOutcome, N as validateIdTokenClaims, de as validateProviderDefinition };

//# sourceMappingURL=index.mjs.map