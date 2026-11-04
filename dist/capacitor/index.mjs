// src/errors.ts
var e = class extends Error {
	constructor(e, t) {
		super(t), this.name = "AuthError", this.kind = e;
	}
}, t = /* @__PURE__ */ new Set(["localhost", "127.0.0.1"]), n = /* @__PURE__ */ new Set([
	"javascript:",
	"data:",
	"vbscript:",
	"file:",
	"blob:"
]);
function r(e) {
	try {
		return new URL(e);
	} catch {
		return null;
	}
}
function i(e, i = !1) {
	let a = r(e);
	return !a || n.has(a.protocol) ? !1 : a.protocol === "https:" || a.protocol !== "http:" || i && t.has(a.hostname);
}
function a(e, t) {
	let n = r(e), i = r(t);
	return !n || !i ? !1 : n.protocol === i.protocol && n.host.toLowerCase() === i.host.toLowerCase() && n.pathname === i.pathname;
}
function o(e) {
	return e === void 0 ? /* @__PURE__ */ new Set(["query"]) : new Set(typeof e == "string" ? [e] : e);
}
function s(e) {
	let t = {};
	return e.forEach((e, n) => {
		t[n] = e;
	}), t;
}
function c(t, n) {
	return {
		ok: !1,
		error: new e(t, n)
	};
}
function l(e, t) {
	if (!i(t.redirectUri, t.development)) return c("config", "Redirect URI is not allowed for this build");
	if (!a(e, t.redirectUri)) return c("provider", "Callback URL does not match the redirect URI");
	let n = new URL(e), r = o(t.responseMode), l = n.hash.length > 1, u = n.search.length > 1, d = r.has("query") || r.has("form_post");
	if (l && !r.has("fragment") || u && !d) return c("provider", "Callback used a response mode the provider does not declare");
	let f = {
		...d ? s(n.searchParams) : {},
		...r.has("fragment") ? s(new URLSearchParams(n.hash.slice(1))) : {}
	};
	return Object.keys(f).length === 0 ? c("provider", "OAuth redirect has occurred but no query or hash parameters were found.") : t.expectedState !== void 0 && f.state !== t.expectedState ? c("state_mismatch", "OAuth state mismatch") : f.error ? f.error === "access_denied" ? c("cancelled", "Authorization was denied") : c("provider", "OAuth provider returned an error") : {
		ok: !0,
		params: f
	};
}
// src/platform/native.ts
function u(e, t) {
	if (t?.expectedState === void 0 && t?.expectedOAuth1Token === void 0) return !0;
	let n = new URL(e), r = [n.searchParams, new URLSearchParams(n.hash.slice(1))];
	return (t.expectedState === void 0 || r.some((e) => e.get("state") === t.expectedState)) && (t.expectedOAuth1Token === void 0 || r.some((e) => e.get("oauth_token") === t.expectedOAuth1Token));
}
function d(t, n, r) {
	let i;
	for (let a of n) {
		if (!u(t, a.validation)) {
			i = {
				waiter: a,
				result: {
					ok: !1,
					error: new e("state_mismatch", a.validation?.expectedOAuth1Token === void 0 ? "OAuth state mismatch" : "OAuth request token mismatch")
				}
			};
			continue;
		}
		let n = l(t, {
			redirectUri: a.redirectUri,
			development: r.development,
			responseMode: a.validation?.responseMode,
			expectedState: a.validation?.expectedState
		});
		if (!n.ok && n.error.kind === "state_mismatch") i = {
			waiter: a,
			result: n
		};
		else return {
			waiter: a,
			result: n
		};
	}
	return n.length === 1 ? i : void 0;
}
var f = "about:blank", p = class {
	constructor(e, t, n) {
		this.bridge = t, this.waiters = n, this.url = e;
	}
	async open(e, t, n, r, i) {
		if (this.url !== f && await this.bridge.openUrl(this.url), !t) return this.waitForCallback(e, n, r, void 0, i);
	}
	async navigate(e) {
		this.url = e;
		try {
			return await this.bridge.openUrl(e), !0;
		} catch {
			return !1;
		}
	}
	waitForCallback(t, n, r, i, a) {
		return new Promise((o, s) => {
			let c = {
				redirectUri: t,
				validation: {
					expectedState: r,
					responseMode: a,
					expectedOAuth1Token: i
				},
				resolve: o,
				reject: s
			};
			n !== void 0 && (c.timer = setTimeout(() => {
				this.waiters.delete(c), s(new e("timeout", "OAuth callback timed out"));
			}, n)), this.waiters.add(c);
		});
	}
	close() {
		this.bridge.closeBrowser();
	}
};
function m(e, t) {
	let n = /* @__PURE__ */ new Set();
	return t.bridge.onUrlOpen((e) => {
		let r = Array.from(n).filter((t) => a(e, t.redirectUri));
		if (r.length === 0) return;
		let i = d(e, r, t);
		if (!i) return;
		let { waiter: o, result: s } = i;
		n.delete(o), o.timer && clearTimeout(o.timer), s.ok ? o.resolve(s.params) : o.reject(s.error);
	}), {
		kind: "native",
		platform: e,
		native: t,
		createSession(e) {
			return new p(e, t.bridge, n);
		}
	};
}
// src/platform/transaction-store.ts
var h = 6e5, g = "usa.tx.", _ = "usa.tx.index", v = class {
	constructor(e, t = h, n = () => Date.now()) {
		this.kv = e, this.ttlMs = t, this.now = n, this.queue = Promise.resolve();
	}
	save(t, n) {
		return this.run(async () => {
			await this.purgeExpired();
			let r = await this.readIndex();
			if (r.includes(t)) throw new e("state_mismatch", "OAuth state mismatch");
			let i = {
				...n,
				createdAt: this.now()
			};
			await this.kv.set(g + t, JSON.stringify(i)), r.push(t), await this.writeIndex(r);
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
		let t = await this.kv.get(g + e);
		if (t) try {
			return JSON.parse(t);
		} catch {
			return;
		}
	}
	async delete(e) {
		await this.kv.remove(g + e);
		let t = await this.readIndex();
		t.includes(e) && await this.writeIndex(t.filter((t) => t !== e));
	}
	async purgeExpired() {
		let e = await this.readIndex(), t = await Promise.all(e.map((e) => this.readRecord(e))), n = e.filter((e, n) => {
			let r = t[n];
			return !r || this.isExpired(r);
		});
		n.length !== 0 && (await Promise.all(n.map((e) => this.kv.remove(g + e))), await this.writeIndex(e.filter((e) => !n.includes(e))));
	}
	async readIndex() {
		let e = await this.kv.get(_);
		if (!e) return [];
		try {
			let t = JSON.parse(e);
			return Array.isArray(t) ? t.filter((e) => typeof e == "string") : [];
		} catch {
			return [];
		}
	}
	async writeIndex(e) {
		e.length === 0 ? await this.kv.remove(_) : await this.kv.set(_, JSON.stringify(e));
	}
};
// src/adapters/capacitor/index.ts
function y(e) {
	let { browser: t, app: n } = e;
	return m(e.platform, {
		bridge: {
			openUrl: async (e) => {
				await t.open({ url: e });
			},
			closeBrowser: async () => {
				await t.close();
			},
			onUrlOpen: (e) => {
				let t, r = !1;
				return n.addListener("appUrlOpen", (t) => e(t.url)).then((e) => {
					r ? e.remove() : t = e;
				}), () => {
					r = !0, t?.remove();
				};
			},
			getLaunchUrl: async () => (await n.getLaunchUrl())?.url
		},
		transactions: new v(e.secureStorage),
		development: e.development ?? !1
	});
}
export { y as createCapacitorAdapter };

//# sourceMappingURL=index.mjs.map