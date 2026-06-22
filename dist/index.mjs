//#region src/options.ts
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
		domain: window.location.hostname,
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
//#endregion
//#region src/utils.ts
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
function i(e, t) {
	return /^(?:[a-z]+:)?\/\//i.test(t) ? t : function(e) {
		return e.replace(/[/]+/g, "/").replace(/\/\?/g, "?").replace(/\/#/g, "#").replace(/:\//g, "://");
	}([e, t].join("/"));
}
function a(e) {
	let t = e.protocol === "https:";
	return e.protocol + "//" + e.hostname + ":" + (e.port || (t ? "443" : "80")) + (/^\//.test(e.pathname) ? e.pathname : "/" + e.pathname);
}
function o(e) {
	let t = {}, n, r;
	return (e || "").split("&").forEach((e) => {
		e && (r = e.split("="), n = decodeURIComponent(r[0]), t[n] = r[1] ? decodeURIComponent(r[1]) : !0);
	}), t;
}
function s(e) {
	if (e.length === 0) return {};
	let t = {}, n = /* @__PURE__ */ RegExp("\\s*;\\s*");
	return e.split(n).forEach((e) => {
		let [n, r] = e.split("="), i = decodeURIComponent(n);
		t[i] = decodeURIComponent(r);
	}), t;
}
function c(e) {
	let { path: t, domain: n, expires: r, secure: i } = e, a = r, o = t, s = n;
	return [
		t == null ? "" : ";path=" + o,
		n == null ? "" : ";domain=" + s,
		r == null ? "" : ";expires=" + a.toUTCString(),
		i == null || i === !1 ? "" : ";secure"
	].join("");
}
function l(e, t, n) {
	return [
		encodeURIComponent(e),
		"=",
		encodeURIComponent(t),
		c(n)
	].join("");
}
//#endregion
//#region src/storage/cookie-storage.ts
var u = class {
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
		let n = l(e, t, { ...this._defaultOptions });
		this._setCookie(n);
	}
	getItem(e) {
		let t = s(this._getCookie());
		return t[e] === void 0 ? null : t[e];
	}
	removeItem(e) {
		let t = l(e, "", {
			...this._defaultOptions,
			expires: /* @__PURE__ */ new Date(0)
		});
		this._setCookie(t);
	}
	_getCookie() {
		return typeof document > "u" || document.cookie === void 0 ? "" : document.cookie;
	}
	_setCookie(e) {
		document.cookie = e;
	}
}, d = class {
	constructor(e) {
		this.namespace = e || null;
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
		this.namespace = e || null, this._storage = {};
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
		this.namespace = e || null;
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
//#endregion
//#region src/storage.ts
function m(e) {
	switch (e.storageType) {
		case "localStorage": try {
			return window.localStorage.setItem("testKey", "test"), window.localStorage.removeItem("testKey"), new d(e.storageNamespace);
		} catch {}
		case "sessionStorage": try {
			return window.sessionStorage.setItem("testKey", "test"), window.sessionStorage.removeItem("testKey"), new p(e.storageNamespace);
		} catch {}
		case "cookieStorage": return new u(e.cookieStorage);
		default: return new f(e.storageNamespace);
	}
}
//#endregion
//#region src/oauth/popup.ts
var h = class {
	constructor(e, t, n) {
		this.popup = null, this.url = e, this.name = t, this.popupOptions = n;
	}
	open(e, t) {
		try {
			return this.popup = window.open(this.url, this.name, this._stringifyOptions()), this.popup && this.popup.focus && this.popup.focus(), t ? Promise.resolve() : this.pooling(e);
		} catch {
			return Promise.reject(/* @__PURE__ */ Error("OAuth popup error occurred"));
		}
	}
	pooling(e) {
		return new Promise((t, n) => {
			let r = document.createElement("a");
			r.href = e;
			let i = a(r), s = setInterval(() => {
				(!this.popup || this.popup.closed || this.popup.closed === void 0) && (clearInterval(s), s = 0, n("Auth popup window closed"));
				try {
					let e = this.popup;
					if (a(e.location) === i) {
						if (e.location.search || e.location.hash) {
							let r = o(e.location.search.substring(1).replace(/\/$/, "")), i = o(e.location.hash.substring(1).replace(/[/$]/, "")), a = {
								...r,
								...i
							};
							a.error ? n(a.error) : t(a);
						} else n("OAuth redirect has occurred but no query or hash parameters were found.");
						clearInterval(s), s = 0, e.close();
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
}, g = {
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
}, _ = class {
	constructor(e, t, n, r) {
		this.$http = e, this.storage = t, this.providerConfig = {
			...g,
			...n
		}, this.options = r;
	}
	async init(e) {
		return this.oauthPopup = new h("about:blank", this.providerConfig.name, this.providerConfig.popupOptions), window && this.oauthPopup.open(this.providerConfig.redirectUri, !0), this.getRequestToken().then(async (t) => {
			let n = this.openPopup(t);
			return this.exchangeForToken(n, e);
		});
	}
	async getRequestToken() {
		let e = {};
		e.method = "POST";
		let t = this.options.requestDataKey;
		return e[t] = { ...this.providerConfig }, e.withCredentials = this.options.withCredentials, this.options.baseUrl ? e.url = i(this.options.baseUrl, this.providerConfig.url) : e.url = this.providerConfig.url, this.$http(e);
	}
	openPopup(e) {
		let t = e[this.options.responseDataKey], n = [this.providerConfig.authorizationEndpoint, this.buildQueryString(t)].join("?"), r = this.oauthPopup, i = r.popup;
		return i.location = n, window ? r.open(this.providerConfig.redirectUri, this.providerConfig.skipPooling) : r.pooling(this.providerConfig.redirectUri);
	}
	exchangeForToken(e, t) {
		let n = {
			...t,
			...e
		}, r = {};
		r.method = "POST";
		let a = this.options.requestDataKey;
		return r[a] = n, r.withCredentials = this.options.withCredentials, this.options.baseUrl ? r.url = i(this.options.baseUrl, this.providerConfig.url) : r.url = this.providerConfig.url, this.$http(r);
	}
	buildQueryString(e) {
		let t = [];
		for (let n in e) {
			let r = e[n];
			t.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
		}
		return t.join("&");
	}
}, v = {
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
}, y = class {
	constructor(e, t, n, r) {
		this.$http = e, this.storage = t, this.providerConfig = {
			...v,
			...n
		}, this.options = r;
	}
	async init() {
		let e = this.providerConfig.name + "_state", t = this.providerConfig.state, n = this.providerConfig.state;
		typeof t == "function" ? this.storage.setItem(e, t()) : r(n) && this.storage.setItem(e, n);
		let i = [this.providerConfig.authorizationEndpoint, this._stringifyRequestParams()].join("?");
		this.oauthPopup = new h(i, this.providerConfig.name, this.providerConfig.popupOptions);
		let a = this.oauthPopup;
		try {
			let e = await a.open(this.providerConfig.redirectUri, this.providerConfig.skipPooling);
			if (e) return e;
		} catch (e) {
			return Promise.reject(e);
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
				if (!(n === "redirect_uri" && !a)) {
					if (n === "state") {
						let e = this.providerConfig.name + "_state";
						a = encodeURIComponent(this.storage.getItem(e));
					}
					n === "scope" && Array.isArray(a) && (a = a.join(this.providerConfig.scopeDelimiter), this.providerConfig.scopePrefix && (a = [this.providerConfig.scopePrefix, a].join(this.providerConfig.scopeDelimiter))), e.push([n, a]);
				}
			});
		}), e.map((e) => e.join("=")).join("&");
	}
}, b = class {
	constructor(t, n) {
		t.interceptors.response.use((e) => e), Object.defineProperties(this, {
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
	async authenticate(e, t, n = {}) {
		let r = this.OverrideOptions.providers[e], i = { provider: {
			...t,
			...r
		} }, a = {
			...this.defaultOptions,
			...i
		};
		this.options = a, this.storage = m(a);
		let o = a, s = o.provider, c = s;
		if (o.bindRequestInterceptor && typeof o.bindRequestInterceptor == "function" && o.bindResponseInterceptor && typeof o.bindResponseInterceptor == "function") {
			let e = {
				options: this.options,
				storage: this.storage,
				$http: this.$http,
				providerConfig: s
			};
			o.bindRequestInterceptor.call(this, e), o.bindResponseInterceptor.call(this, e);
		} else throw Error("Both request and response interceptors must be functions");
		if (!s) return Promise.reject("Unknown provider");
		try {
			let e;
			switch (c.oauthType) {
				case "1.0":
					e = new _(this.$http, this.storage, s, a);
					break;
				case "2.0":
					e = new y(this.$http, this.storage, s, a);
					break;
				default: return /* @__PURE__ */ Error("Invalid OAuth type");
			}
			return e.init(n).then((e) => e).catch((e) => Error(e));
		} catch (e) {
			return e;
		}
	}
}, x = {
	apple: {
		name: "apple",
		url: "",
		authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
		redirectUri: window.location.origin + "/",
		requiredUrlParams: ["scope"],
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
		redirectUri: window.location.origin + "/",
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
		redirectUri: window.location.origin,
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
		redirectUri: window.location.origin,
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
		redirectUri: window.location.origin,
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
		redirectUri: window.location.origin,
		oauthType: "2.0",
		popupOptions: {
			width: 495,
			height: 645
		}
	},
	twitter2: {
		name: "twitter",
		url: "/auth/twitter",
		authorizationEndpoint: "https://api.twitter.com/oauth/authenticate",
		tokenURL: "https://api.twitter.com/oauth2/token",
		redirectUri: window.location.origin,
		scopeDelimiter: ",",
		sessionKey: "oauth:twitter",
		userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json",
		oauthType: "2.0",
		popupOptions: {
			width: 495,
			height: 645
		}
	},
	bitbucket: {
		name: "bitbucket",
		url: "/auth/bitbucket",
		authorizationEndpoint: "https://bitbucket.org/site/oauth2/authorize",
		redirectUri: window.location.origin + "/",
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
		redirectUri: window.location.origin,
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
		redirectUri: window.location.origin + "/",
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
		redirectUri: window.location.origin,
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
	oauth1: {
		name: null,
		url: "/auth/oauth1",
		authorizationEndpoint: null,
		redirectUri: window.location.origin,
		oauthType: "1.0",
		popupOptions: null
	},
	oauth2: {
		name: null,
		url: "/auth/oauth2",
		clientId: null,
		redirectUri: window.location.origin,
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
}, S = x.apple, C = x.facebook, w = x.google, T = x.github, E = x.instagram, D = x.twitter, O = x.bitbucket, k = x.linkedin, A = x.vkontakte, j = x.live, M = x.oauth1, N = x.oauth2, P = b;
//#endregion
export { S as Apple, O as Bitbucket, C as Facebook, T as Github, w as Google, E as Instagram, k as Linkedin, j as Live, M as Oauth1, N as Oauth2, x as Providers, D as Twitter, b as UniversalSocialauth, A as Vkontakte, P as default };

//# sourceMappingURL=index.mjs.map