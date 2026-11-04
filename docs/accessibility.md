# Accessibility and end-user recovery

Universal Social Auth is framework-neutral and does not render UI. Accessibility
is therefore mostly the application's responsibility. This page lists what the
library guarantees, and what your login UI must do.

## Accessible login buttons

- Give every provider button a visible text label, such as "Continue with GitHub".
  Do not use an icon alone.
- Use a native `<button>` (or `<a>` for navigation). Do not attach click handlers
  to `<div>` elements.
- Disable the button while a login is in progress and set `aria-busy="true"`
  on the container, so screen readers know work is pending.

## Focus restoration after the popup

The popup takes focus away from the page. When the flow finishes, the library
does not move focus for you. After `authenticate()` settles, return focus to the
button that started the login, or to a heading on the next screen:

```ts
const button = document.getElementById('login-github') as HTMLButtonElement;
button.disabled = true;
const result = await auth.authenticate('github', Providers.github);
button.disabled = false;
button.focus();
```

## Status messages that are not colour-only

Announce outcomes in text inside a live region. The vanilla example uses
`<output id="status">`, which has an implicit `aria-live="polite"`:

```html
<output id="status" aria-live="polite"></output>
```

Do not rely on red or green alone. Pair each message with words such as
"Sign-in failed" or "Signed in as Ada".

## Recovery by error kind

Errors carry a stable `kind` (see `AuthErrorKind` in `src/errors.ts`). Map each
kind to a message and a next step. Never retry automatically.

| `kind` | Meaning | Suggested UI |
| --- | --- | --- |
| `cancelled` | The user closed the popup. | Say "Sign-in was cancelled." Offer the button again. Do not show it as an error. |
| `popup_blocked` | The browser blocked the popup. | Say "Your browser blocked the sign-in window. Allow pop-ups for this site, then try again." Keep the button enabled for a manual retry. |
| `timeout` | The callback did not arrive in time. | Say "Sign-in took too long." Offer a retry. Popup polling defaults to five minutes; raise `callbackTimeout` only if your provider is slow. |
| `state_mismatch` | The response did not match the request. | Say "Sign-in could not be verified. Please try again." Log the kind, not the state value. |
| `invalid_token` | The backend rejected the token. | Say "We could not confirm your account." Send the user to a support page. |
| `provider` | The provider returned an error. | Show a generic message. Include the provider's error text only if it is safe to display. |
| `config` | The integration is misconfigured. | Show a generic message to users. Report the detail to developers in logs. |
| `unknown` | Anything else. | Show a generic message and offer a retry. |

## Retry behaviour

- Start one login per user action. Do not loop on `popup_blocked` or `timeout`.
- Disable the trigger while a flow is pending, so double clicks cannot open two
  popups.
- Use the lifecycle hooks in [lifecycle](./lifecycle.md) to update UI state
  without polling.

```ts
const auth = new UniversalSocialauth(http, {
  hooks: {
    onStart: () => setBusy(true),
    onComplete: () => setBusy(false),
    onCancel: () => setBusy(false),
    onError: ({ kind }) => {
      setBusy(false);
      showError(kind);
    }
  }
});
```

## Localisation hooks

The library returns `kind` values, not user-facing text. Keep the message
strings in your own translation files, keyed by `kind`.

## Testing checklist

Run these checks on your login screen before release:

- [ ] Tab reaches every provider button, and the focus ring is visible.
- [ ] Enter and Space activate each button.
- [ ] A screen reader announces the busy state and the final outcome.
- [ ] Closing the popup shows the cancelled message, with focus back on the button.
- [ ] Blocking pop-ups shows the blocked message, and a manual retry works.
- [ ] No message depends on colour alone.

The example apps have not been tested with a screen reader in CI. Run the
checklist manually before you ship.
