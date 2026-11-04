import { AuthErrorKind } from './errors';

export interface LifecycleEvent {
  provider: string;
}

export interface LifecycleErrorEvent extends LifecycleEvent {
  kind: AuthErrorKind;
}

/**
 * Optional, opt-in callbacks. Payloads contain only the provider name and an
 * error kind: no codes, tokens, or user data.
 */
export interface LifecycleHooks {
  onStart?: (event: LifecycleEvent) => void;
  onComplete?: (event: LifecycleEvent) => void;
  onCancel?: (event: LifecycleEvent) => void;
  onError?: (event: LifecycleErrorEvent) => void;
}

export function emitHook<K extends keyof LifecycleHooks>(
  hooks: LifecycleHooks | undefined,
  name: K,
  event: Parameters<NonNullable<LifecycleHooks[K]>>[0]
): void {
  const hook = hooks?.[name] as ((e: typeof event) => void) | undefined;
  if (typeof hook !== 'function') return;
  try {
    hook(event);
  } catch {
    // A failing observer must never break the login flow.
  }
}
