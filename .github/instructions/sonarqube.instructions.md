---
applyTo: "**/*.{ts,js,mjs,cjs,html}"
---

# SonarQube rules

Every change to TypeScript, JavaScript or HTML in this repository must pass SonarQube with no new warnings. Before finishing a change, check the edited files with the SonarQube analyzer or the Problems view and fix what it reports.

## Rules that recur in this repo

- **Cognitive complexity (typescript:S3776), max 15.** Split long functions. Move branches into named helpers, and use early returns instead of nested `if`s.
- **Regex backtracking (typescript:S8786).** Do not use patterns such as `/x+$/` on untrusted input. Use a bounded loop or a simpler pattern instead.
- **Use `.includes()` for existence checks (typescript:S7765).** Do not use `indexOf(...) === -1`. The `lib` setting in `tsconfig.json` must include `es2016` or later.
- **`String.fromCodePoint()` over `String.fromCharCode()` (typescript:S7758).**
- **Compare with `undefined` directly (typescript:S7741).** Do not use `typeof x === 'undefined'`.
- **Optional chaining (typescript:S6582).** Use `a?.b` instead of `a && a.b` or `a === undefined ? ... : a.b`.
- **Semantic HTML (Web:S6819).** Use `<output>` for status messages instead of `role="status"` on other elements.
- **No unused catch bindings.** Use `catch {` when the error is not used.
- **Casts.** Avoid double casts such as `<T>(<unknown>x)`. Use typed APIs such as `window.setInterval`, which returns a `number`.

## Verification

1. Run `npx tsc --noEmit` and `npm test`. Both must pass.
2. Run the SonarQube analyzer on each changed file, or check the Problems view.
3. Fix every reported issue in code. Do not add `NOSONAR` or suppression comments unless the user asks for one.
