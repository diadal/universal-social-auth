# Feature Roadmap

This document records candidate features that could make Universal Social Auth
easier for application developers and end users. These are proposals, not
implemented behavior or compatibility guarantees. Prioritize security,
framework-neutral core behavior, and small optional adapters.

## Goals

- Make first integration predictable across frontend frameworks and backend stacks.
- Improve authentication accessibility, error handling, and recovery for end users.
- Support maintained Node.js releases and projects with older runtimes without forcing every consumer to upgrade at once.
- Keep provider credentials and token exchange on trusted servers.
- Make AI-assisted project integration accurate through versioned docs, types, and read-only tooling.

## Candidate Features

### 1. OIDC and enterprise SSO adapters

Add first-class OpenID Connect discovery, PKCE, nonce, issuer/audience checks,
and tested callback handling where supported by the browser library. Document
that token validation and code exchange belong on the backend. Evaluate SAML
separately as an enterprise backend integration because SAML assertion parsing
and signature validation are server responsibilities and should not be added to
the browser bundle. Offer recipes for common identity providers such as Okta,
Microsoft Entra ID, and Keycloak without making their SDKs mandatory core
dependencies.

Acceptance criteria: threat model reviewed; PKCE/state/nonce behavior covered
by tests; redirect URI and callback contracts documented; no client secrets in
browser code; backend examples use maintained, provider-supported libraries.

### 2. Authorization Code + PKCE support

Formalize a PKCE flow for public clients, including verifier lifecycle, S256
challenge generation, state/nonce handling, and callback error cases. Use a
maintained crypto implementation only where the supported browser and Node
runtimes provide no suitable built-in. Keep code exchange server-side unless a
provider explicitly supports public-client exchange.

Acceptance criteria: interoperable provider tests, secure random generation,
no verifier leakage in logs or URLs beyond the protocol requirement, and
documented backend exchange responsibilities.

### 3. Typed result and error contracts

Replace loosely typed success/error values with stable discriminated result
types for success, user cancellation, popup blocked, provider rejection,
callback timeout, and configuration errors. Preserve existing behavior with a
documented migration path and semver policy.

Acceptance criteria: declarations match runtime results, errors are sanitized,
and framework examples handle cancellation and provider errors accessibly.

### 4. Framework adapters and examples

Maintain minimal examples for vanilla TypeScript, Vue 2, Vue 3, Nuxt SSR,
React, Angular, and Capacitor. Keep adapters optional and independent of the
framework-neutral core. Prefer framework peer dependencies in adapter packages
so a Vue application does not install React dependencies.

Acceptance criteria: each example has a tested install/build path, client-only
boundaries are explicit, and no integration calls the popup during render or
server-side rendering.

### 5. Backend recipes and starter integrations

Provide maintained server-side recipes for Laravel Socialite and selected Node
frameworks such as Express, Fastify, and NestJS. Recipes should define the
authorization callback, code exchange, identity validation, safe account
linking, application session creation, logout, and CSRF protections. Keep
backend code outside the browser package and do not imply that OAuth login
automatically creates an application session.

Acceptance criteria: runnable sample projects, security review, environment
variable examples with placeholders only, and integration tests using mock
identity-provider responses.

### 6. Provider catalog generation and validation

Define provider metadata in a validated, versioned schema and generate runtime
definitions, TypeScript declarations, docs, and MCP responses from that single
source. Add checks for missing endpoints, invalid OAuth versions, malformed
scopes, and provider-specific callback requirements.

Acceptance criteria: generated output is deterministic; schema changes are
reviewed; and built package artifacts stay in sync with source.

### 7. Accessibility and end-user recovery

Document accessible login button labeling, focus restoration after popup
completion, popup-blocked recovery, cancellation feedback, localization hooks,
and clear retry behavior. Avoid forcing UI components into the framework-neutral
package; offer optional adapters only where they materially improve usability.

Acceptance criteria: keyboard and screen-reader testing in example apps,
non-color-only error status, and no automatic repeated login attempts.

### 8. Session and account lifecycle guidance

Add server-owned guidance for logout, account unlinking, provider revocation,
refresh-token rotation, email changes, and account linking. Make clear which
actions require provider API calls and which invalidate the application's own
session.

Acceptance criteria: no token persistence in browser storage by default;
examples describe secure, HttpOnly cookie sessions and provider revocation
limits.

### 9. AI integration support

Expand the MCP catalog with version-aware API documentation, configuration
validation, and framework recipe retrieval. Keep tools deterministic and
read-only by default. An optional project configuration checker could inspect
files only with explicit user selection and must redact environment values.
Version the agent skill alongside releases and include examples that match the
published declarations.

Acceptance criteria: no secret discovery or transmission, documented tool
schemas, and smoke tests against MCP clients.

### 10. Observability hooks

Offer optional typed lifecycle callbacks for started, completed, cancelled,
and failed flows. Keep payloads free of codes, tokens, and personal data unless
the application explicitly opts into sanitized metadata.

Acceptance criteria: callback behavior tested for popup and redirect paths,
no PII in default telemetry, and instrumentation remains opt-in.

## Node.js and Project Compatibility

The library primarily runs in browsers; Node.js compatibility matters for
module loading, SSR imports, build tooling, and any future backend packages.
Avoid claiming support for every historical and future Node version. Publish a
tested runtime matrix with each release.

- Keep the browser library's core output free of unnecessary Node built-ins and
  runtime-only dependencies.
- Test SSR import behavior separately from browser OAuth behavior.
- For a future backend integration package, identify the oldest supported Node
  LTS first and test it in CI before declaring compatibility.
- Test current active and maintenance LTS releases, plus the next Node release
  during its release-candidate period where practical.
- If a feature needs newer runtime APIs, use a small optional adapter or a
  documented polyfill path rather than silently raising the core minimum.
- Publish ESM and CommonJS entry points with explicit `exports`, `types`, and
  `engines` metadata, and test both import modes in clean consumer projects.
- Test supported TypeScript versions and framework versions independently;
  JavaScript consumers should not need TypeScript at runtime.
- Keep dependencies minimal and inspect their runtime engine requirements
  before adding them to the core package.

## Suggested Delivery Order

1. Stabilize provider schema, typed results, error handling, and security docs.
2. Add OIDC/PKCE capabilities with security review and backend recipes.
3. Maintain framework examples and accessibility improvements.
4. Add optional enterprise SSO and backend integrations based on user demand.
5. Expand AI tooling and lifecycle observability after the metadata contract is stable.

## Release Gates

- Unit and integration tests cover callback validation, OAuth state, popup
  cancellation, and provider configuration.
- CI exercises the declared Node, TypeScript, and module-format matrix.
- Package tarball contains all documented exports and no local secrets.
- Security guidance has been reviewed for frontend/backend responsibility
  boundaries.
- Release notes identify breaking changes and migration steps.
