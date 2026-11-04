# Plan: native mobile and hybrid SDK support

Status: **patch preparation in progress; Capacitor device verification pending.** The web adapter, platform overrides, structural Capacitor adapter, and declaration outputs are implemented. Native callback routing, response-mode validation, and the OAuth1 `skipPooling` exchange bug have regression coverage with mocks. Concrete secure-storage integration, listener lifecycle/cancellation, a Capacitor example, and device verification remain incomplete, so documentation must not imply production verification. Version 0.3.1 is set in package metadata; the registry check on 2026-11-04 reported 0.3.0 as latest and 0.3.1 unpublished. Cordova tasks 6 and 8 are deferred; this plan's release scope is Capacitor for iOS and Android, while preserving existing web behavior.

## Current state (grounding)

- Web sign-in still uses the popup flow. Hosts can select a native adapter with
  `setPlatform`; the Capacitor subpath supplies a structural adapter around injected
  Browser, App, and secure-storage objects. The adapter has Jest coverage, but has not
  been verified on a device.
- Native pending transactions are stored through an injected `KeyValueStore`. The
  Capacitor adapter does not provide a Keychain/Keystore implementation; secure,
  persistent storage is currently the host app's responsibility. The transaction store
  serializes operations within one store instance, not across processes or instances.
- Native OAuth2 generates state when the provider config has no state value. Callback
  waiters now match by state (or OAuth1 request token) as well as redirect URI. Saving an
  already-active transaction key fails rather than overwriting it; concurrent attempts
  configured with the same static state therefore fail safely, and callers should use
  unique states or leave state unset. Configured response modes are passed to callback
  parsing.
- OAuth1 `skipPooling` now returns without calling the exchange endpoint when the callback
  has not arrived. The mocked cold-start test resumes the stored transaction and exercises
  the exchange afterward; device behavior remains unverified.
- Native session close does not remove or reject its callback waiter. A user closing the
  browser may remain pending indefinitely when no callback timeout is configured. The
  Capacitor URL-open listener is also registered asynchronously without an awaited ready
  state or surfaced registration failure.
- The library does not exchange codes for tokens in the OAuth2 path. `OAuth2.init()` returns
  the callback params plus the PKCE verifier and nonce, and the app sends what its backend
  needs. OAuth1 does make backend calls: a request-token call (`getRequestToken`) and a
  callback exchange (`exchangeForToken`). The client secret must stay on the backend.
- README, Capacitor guide, FAQ, and agents guide describe Capacitor with device verification
  pending. Cordova, Ionic-native integration, and NativeScript are not implemented by this
  release; Ionic is intended to use the Capacitor adapter.

## Why native needs a different flow

- Embedded WebViews are blocked by Google and other providers. Login must run in a browser
  surface outside the WebView. The surfaces differ:
  - Capacitor's `@capacitor/browser` uses `SFSafariViewController` on iOS, not
    `ASWebAuthenticationSession`. Android uses Custom Tabs.
  - Cordova InAppBrowser's `_blank` target is an in-app browser. `_system` opens the
    system browser.
  The surface must be chosen per platform and verified to complete the provider login and
  return flow (see Decision 6).
- The browser returns to the app through a deep link: a custom URL scheme or a
  universal/app link. The app must catch that URL.
- The app can be killed while the user is in the browser. Any PKCE verifier, `state`,
  and nonce must survive a cold start, so they need encrypted native storage
  (Keychain / Android Keystore), not memory. The restarted app must also be able to
  receive the callback (see Design 8).
- Popup and `window` APIs are not available. All browser-only code paths must stay
  behind the web adapter.

## Bundle size and platform isolation

The core must not import native SDK packages. The current root entry does include generic
platform-selection and native-flow code, so web users do receive that code; the bundle has
grown from its original baseline. The Capacitor SDK objects are injected by the host and are
not imported by the library.

- **No native imports in core.** `src/` must never import `@capacitor/*`, `cordova`,
  or other native packages. Native adapters live under their own folder and are
  reached only through subpath exports.
- **Separate entry points.** The root, `./providers`, and `./capacitor` exports exist.
  Cordova is deferred and has no export. Vite currently builds JavaScript and source maps
  only; declaration files are not generated, including for the Capacitor subpath. Add and
  verify declarations and a `types` export before treating this gate as complete.
- **Injected dependencies.** There are no Capacitor or Cordova peer dependencies. The host
  passes Browser, App, and secure-storage implementations to the structural adapter.
- **Tree-shaking:** `sideEffects: false` in `package.json`, so a bundler drops any
  unused adapter.
- **Size budget in CI:** `scripts/check-bundle.mjs` gzips `dist/index.mjs` and rejects
  sizes above 9,100 bytes or references to `@capacitor` / `cordova`. The measured bundle is
  9,099 bytes. This check does not prove that generic native-flow code is absent from the
  web bundle and is not a sample-app build.

## Design

1. **Platform adapter interface** (`src/platform/`):
   - `PlatformAdapter` selects `web` or `native` and creates an `AuthSession`.
   - `AuthSession` provides `open`, `navigate`, `waitForCallback`, and `close`.
   - `NativeBridge` provides `openUrl`, `closeBrowser`, `onUrlOpen`, and `getLaunchUrl`.
   - `NativeContext` carries the bridge, transaction store, and development redirect flag.
   - Callback waiters must be cancelled and removed when a session closes or times out;
     listener registration errors and readiness must be surfaced to the host.
2. **Web adapter**: wraps the current `OAuthPopup` behavior with no change in behavior.
   This is the default, so existing users need no changes.
3. **Native adapter**: uses the system browser plus deep-link callback. It takes
   injected functions, so the core library has no hard dependency on Capacitor or Cordova.
4. **Capacitor adapter**: `universal-social-auth/capacitor` wraps injected
   `@capacitor/browser` and `@capacitor/app` APIs. The host must inject a persistent,
   secure Keychain/Keystore-backed store. A concrete storage integration and device
   verification are still outstanding. Cordova is deferred.
5. **Secure transaction store**: persist `{ provider, codeVerifier, nonce,
   oauth1RequestTokenSecret, createdAt }` per attempt, keyed by OAuth2 `state` or the
   OAuth1 request token.
   Rules:
   - Every native attempt must have a unique `state`, even when `cfg.state` is unset.
     The current implementation generates one only when state is unset; configured
     static values can be reused and must be addressed.
   - Consumption is single-use within one `TransactionStore` instance. The current
     promise queue does not provide cross-instance or cross-process atomicity.
   - TTL is 10 minutes. Expired entries are purged during save/consume, not at store
     construction.
   - Concurrent attempts are isolated by their own `state` key. Starting a new attempt
     does not delete another pending attempt for a different provider.
   - The entry is deleted on success, cancel, timeout, provider error, and state mismatch.
     Current mismatch routing does not guarantee deletion of the correct attempt's entry.
   - The native host must provide secure persistent storage (Decision 3). The current
     adapter accepts an injected store but does not implement or verify one.
6. **Redirect and callback policy**:
   - Custom schemes: exact match on scheme, host, and path. Example:
     `myapp://auth/callback` must match `scheme=myapp`, `host=auth`, `path=/callback`.
   - Verified HTTPS app links: exact match on `https`, host, and path, plus platform
     association (`apple-app-site-association` on iOS, `assetlinks.json` on Android)
     and the matching entitlements or intent filters. These are required setup steps.
   - Reject any `http:` redirect except `localhost` or `127.0.0.1` in development builds
     (the same rule as `isHttpsOrLocalhost` in `src/providers/schema.ts`). Production
     builds reject all `http:` redirects.
   - The parser and native callback integration support query, fragment, and query-relayed
     `form_post` modes when passed the declared mode.
   - Match callback state or OAuth1 request token to the specific waiter before consuming
     its transaction. The native adapter now does this and rejects a duplicate active
     transaction key; regression tests cover concurrent OAuth2 and OAuth1 callbacks.
   - Keep PKCE S256 on all platforms.
7. **Provider config and precedence**: some providers (Google iOS and Android clients)
   need a reversed client ID scheme or a platform-specific client ID. Add per-platform
   `clientId` and `redirectUri` fields. Precedence: the platform-specific value, then the
   base value, then the default. Apply the same rules to the OAuth1 and OAuth2 config types
   (`src/oauth/oauth1.ts`, `src/oauth/oauth2.ts`). Validate them in
   `validateProviderDefinition` (`src/providers/schema.ts`). Document the provider-console
   redirect URIs each platform needs, and the backend redirect and exchange expectations.
8. **Cold-start and warm callback contract**: `resumePendingSignIn()` handles a callback
   URL supplied by the host, and the bridge exposes launch-URL and URL-open APIs. The
   current Capacitor guide reads `App.getLaunchUrl()` directly. The adapter subscribes to
   `appUrlOpen`, but it discards the unsubscribe handle and has no disposal API. Add
   explicit listener lifecycle management and test cold-start and warm callbacks on
   devices. Cordova launch behavior remains deferred.
9. **OAuth1 sequence**: the mocked ordinary flow calls the backend request-token route,
   stores the request-token secret, opens the authorization URL, receives the callback,
   and calls the exchange route. With `skipPooling`, `init()` now returns without an
   exchange; after `resumePendingSignIn()` restores the callback parameters and secret, the
   caller can invoke the exchange. This sequence is covered by a mock test, not a device.
10. **Scope of this release**: see Decision 5.

## Work breakdown

| # | Task | Output | Depends on | Status |
|---|------|--------|------------|--------|
| 1 | Write the adapter interface and move the web popup behind it | `src/platform/types.ts`, `src/platform/web.ts`; preserve existing web tests | none | Implemented; automated tests pass |
| 2 | Redirect and callback policy | Exact redirect matching and parser tests for state, errors, and response modes; native integration routes by state/token and passes configured mode | 1 | Implemented; integration regression tests pass |
| 3 | Secure transaction store | TTL and per-key tests; single-use within one store instance; reject duplicate active keys; document host storage and atomicity limits | 1 | Implemented within one store instance; native secure backend not supplied |
| 4 | OAuth2 and OAuth1 through the adapter, including warm and cold callbacks | Tests for PKCE, nonce, concurrent state routing, callback modes, timeout/cancel cleanup, and OAuth1 skipPooling/cold resume; no `window` use in native paths | 1, 2, 3 | Partial; mock coverage passes; listener cancellation/readiness and device behavior remain |
| 5 | Per-platform provider config and validation | Override precedence and schema validation for web/iOS/Android | 2 | Implemented; tests pass |
| 6 | Verify the Cordova launch-URL API and browser surface | Cordova device spike | 2 | Deferred; outside this release |
| 7 | Capacitor adapter subpackage | Structural Browser/App adapter, documented secure-storage injection, awaited listener registration/disposal, package exports | 3, 4, 5 | Partial; no concrete secure-storage integration or listener lifecycle API |
| 8 | Cordova adapter subpackage | `src/adapters/cordova/` | 3, 4, 6 | Deferred; outside this release |
| 9 | Build and release gates | Web size/SDK-reference gate, Capacitor JS outputs, declaration generation and type export, package compatibility checks | 7 | Implemented; JS/declaration outputs, type exports, tarball checks, and consumer type check are wired |
| 10 | Capacitor example app | `examples/capacitor-app` for iOS and Android; Cordova excluded | 7, 9 | Pending |
| 11 | Device verification matrix | Run the matrix below on iOS 17+ and Android 14+ | 10 | Pending; requires devices |
| 12 | Docs and claims | Keep README, Capacitor guide, FAQ, agents guide, and SEO claims aligned with verified support; disclose pending device verification until task 11 passes | 11 | Caveat docs updated; final verification and SEO review pending |
| 13 | Prepare and publish a patch release | Use patch versions 0.3.1–0.3.9, then 0.4.0; pass test/build/docs gates before publishing | 11, 12 | 0.3.1 metadata is set and registry check found it unpublished; release PR and final gates remain, native behavior remains device-unverified |

## Decisions (resolved)

1. **First target: Capacitor only.** Cordova tasks 6 and 8 are deferred and are not shipped
   in this release; the Cordova spike has not been completed.
2. **Package layout: subpath exports** in this repo.
3. **Storage backend on native: secure persistent storage only.** The adapter requires the
   host to inject a Keychain/Keystore-backed `KeyValueStore`; it does not bundle a plugin.
   `@capacitor/preferences` is not approved for secrets. Concrete plugin selection and
   device verification remain open.
4. **Apple Sign-In: deferred.** It is not part of this plan.
5. **Release scope (a):** ship Capacitor only. Ionic is covered through the Capacitor adapter.
   NativeScript is deferred.
6. **Browser surface:** Capacitor currently uses the injected `@capacitor/browser` API.
   The exact iOS/Android return behavior still requires device verification. The Cordova
   browser-surface spike is deferred with Cordova.
7. **Localhost and dev policy: dev-only.** `http://localhost` and `127.0.0.1` redirects are
   allowed only when the explicit `development` flag is set. Production rejects them.

## Size baseline (accepted)

- Web entry `dist/index.mjs` before this plan: 24,865 bytes raw, 6,754 bytes gzipped.
- After task 1 (adapter behind the web popup): 25,252 bytes raw, 6,862 bytes gzipped.
  The user accepted this one-time growth of about +108 bytes gzipped. This is the new baseline.
  Any further growth of the web entry still requires a plan change.
- After task 2 (redirect policy, tree-shaken out of the web entry): unchanged at 6,862 gzipped.
- After task 7 (Capacitor adapter and generic native branches in core): 8,612 gzipped.
  The user accepted this growth; the web entry therefore does include generic native-flow code.
- After task 5 (platform overrides and validation): 8,959 gzipped. The user accepted this as the budget.
- After the SonarQube/lint refactors (oauth1/oauth2 helpers, schema helper): 9,071 gzipped. The user accepted growth and raised the budget to 9,100.
  The `check:bundle` gate enforces it. The native callback fixes and tests currently measure
  9,099 gzipped, still within the accepted budget.

## Progress and deviations

- Tasks 1 and 5: implemented; current automated suite has 11 suites and 78 passing tests,
  and `tsc --noEmit` is clean.
- Task 2: callback state/token routing and response-mode plumbing are implemented and covered
  by regression tests for concurrent OAuth2/OAuth1 callbacks and fragment mode.
- Tasks 3–4: store duplicate-key protection and the OAuth1 skipPooling/cold-resume mock flow
  are implemented. Task 4 remains partial because native close/cancel and listener lifecycle
  behavior need implementation/tests, and no device verification has run.
- Task 6 (Cordova spike) and task 8 (Cordova adapter): deferred per decision 1. Not built.
- Task 7: a structural adapter is implemented. Host apps inject Browser, App, and storage;
  no native SDK imports or peer dependencies are added. Listener disposal and a concrete
  secure-storage integration are outstanding.
- Task 9: `scripts/check-bundle.mjs` runs in CI and enforces the 9,100-byte gzip budget
  plus the absence of `@capacitor` and `cordova` strings in the root bundle. The measured
  size after the callback fixes is 9,099 bytes. The build emits ESM/CommonJS JavaScript,
  source maps, and declarations for the root, providers, and Capacitor adapter. Compatibility
  checks verify tarball declarations and compile a consumer project against the public subpaths.
  The lockfile is now valid npm lockfile v3; `npm ci` passes.
- Task 10: no Capacitor example app exists. Task 11 remains pending real iOS and Android
  verification.
- Task 12: README, Capacitor guide, FAQ, and agents guide include a device-verification
  caveat. Final support claims and SEO copy still need review after task 11.
- Task 13: package version is 0.3.1. The version policy is patch releases 0.3.1 through
  0.3.9, then 0.4.0. The npm registry reported 0.3.0 as latest and no 0.3.1 release on
  2026-11-04. `tsc`,
  Jest (78 passing), build, `check:bundle`, `compat:check`, and the docs-site build must pass
  on the release PR; `d:doc` is not a validation command because it deploys. The release
  remains unverified on devices.
- Platform overrides (task 5) are applied in `authenticate.ts` before the OAuth class is constructed.

## Risks

- Google and some other providers reject embedded WebViews, so the system browser
  is required. Do not offer a WebView fallback.
- Cold-start restore adds a secret-bearing store on the device. The TTL and single-use
  rules must be tested.
- Configured static state is reused. A second simultaneous attempt with the same key is now
  rejected rather than overwriting the first; hosts that need concurrent attempts must use
  unique configured states or omit `state` and let the library generate one.
- Closing the native browser does not currently reject/remove the pending callback waiter;
  without a configured timeout, a sign-in may remain pending. Listener setup errors/readiness
  also need explicit handling.
- Deep-link handling differs between iOS and Android, and between app versions. Task 11's
  device matrix is required before release.
- Until task 11 passes, docs must describe Capacitor as implemented but pending device
  verification, not as verified production support. Cordova and NativeScript remain out of
  scope.

## Verification

- Current simulated checks: `npm test -- --runInBand` passes 78 tests in
  11 suites; `npx tsc --noEmit`, `npm run build`, `npm run check:bundle`, and
  `npm run compat:check` pass. ESLint and Sonar analysis on changed files are clean. These
  use mocks and do not establish device behavior.
- Build: `npm run build` emits ESM/CommonJS JavaScript, source maps, and `.d.ts` files for the
  root, providers, and Capacitor entries. `npm run compat:check` checks the packed declaration
  files and runs a consumer TypeScript compile against all public subpaths. `prepack` runs
  the build before packing or publishing.
- `npm run check-up` is not a gate. It updates dependencies and runs `npm install`. There is
  no `lint` script today. If task 9 adds linting, use the existing `eslint.config.mjs`.
- Add and run the Capacitor example on a simulator and a device for each supported platform.
- Device matrix (task 11) covers:
  - OAuth1, and OAuth2 with PKCE, on at least one provider each.
  - OIDC nonce.
  - State mismatch and provider `error` or `access_denied` callbacks.
  - Cancel and timeout.
  - Two concurrent attempts.
  - Cold launch through `getLaunchUrl()`, and warm resume through the URL-open event.
  - Custom scheme and verified app link.
  - Pass criteria: the app gets a validated result or a classified error, and no
    transaction remains in storage afterward. "Signed in" alone is not enough.
- Automated regression tests now cover concurrent callbacks with the same redirect URI but
  different state/token, fragment response mode through the native flow, duplicate active
  transaction keys, and OAuth1 `skipPooling` with resumed exchange. Still add tests for
  browser close/timeout cleanup and listener-registration failure/readiness/disposal.
- CodeQL and Sonar stay clean for the new storage code.
- **Bundle size:** the accepted root-entry budget is 9,100 gzip bytes. The CI check also
  rejects Capacitor/Cordova SDK-name references; it does not prove generic native-flow
  code is absent. A separate sample web build can be added if tree-shaking isolation
  becomes a release requirement.
