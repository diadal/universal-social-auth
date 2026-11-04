---
name: sonarqube-rules
description: Keep TypeScript, JavaScript and HTML changes free of SonarQube warnings in universal-social-auth. Use when writing or editing code in this repo, when the user mentions SonarQube, Sonar warnings, code smells, cognitive complexity, or asks to fix analyzer issues.
---

# SonarQube rules for universal-social-auth

Follow these rules for every code change in this repository. Use them while writing code, not only after the analyzer reports problems.

## Workflow

1. Before editing, read the file and note any existing warnings in the Problems view.
2. Write the change using the rules below.
3. Run the analyzer on each changed file with `sonarqube_analyzeFile`, then read the results with `problems` for the same paths. If the Problems view shows stale output after a change, re-trigger the analysis once.
4. Run `npx tsc --noEmit` and `npm test`. Both must pass.
5. Fix every new or remaining warning in code.

## Rules

- **Cognitive complexity max 15 (S3776).** Extract helpers, return early, and avoid deep nesting.
- **Avoid super-linear regex (S8786).** Do not use `/x+$/`-style patterns on input. Use a loop or a simpler pattern.
- **`.includes()` for existence checks (S7765).** The `tsconfig.json` `lib` must include `es2016` or later.
- **`String.fromCodePoint()` over `String.fromCharCode()` (S7758).**
- **Compare with `undefined` directly (S7741).**
- **Optional chaining (S6582).** Write `a?.b`.
- **`<output>` for status text in HTML (S6819).**
- **Use `catch {` without a binding when the error is unused.**
- **Avoid double casts.** Use typed APIs such as `window.setInterval`.
- **No suppression comments** such as `NOSONAR` unless the user asks for one.

## Notes

- Only comment code that needs clarification, per the repository's style rule.
- Rules apply to the library in `src/` and to examples in `examples/`.
