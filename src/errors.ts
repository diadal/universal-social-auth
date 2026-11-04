export type AuthErrorKind =
  | 'cancelled'
  | 'popup_blocked'
  | 'timeout'
  | 'state_mismatch'
  | 'invalid_token'
  | 'provider'
  | 'config'
  | 'unknown';

export class AuthError extends Error {
  readonly kind: AuthErrorKind;

  constructor(kind: AuthErrorKind, message: string) {
    super(message);
    this.name = 'AuthError';
    this.kind = kind;
  }
}

export function classifyError(err: unknown): AuthErrorKind {
  return err instanceof AuthError ? err.kind : 'unknown';
}

export type AuthOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; kind: AuthErrorKind; error: Error };

/**
 * Wraps a login promise in a discriminated result. Resolved `Error` values
 * (returned for configuration problems) are reported as failures.
 */
export async function toOutcome<T>(work: Promise<T>): Promise<AuthOutcome<T>> {
  try {
    const data = await work;
    if (data instanceof Error) {
      return { ok: false, kind: classifyError(data), error: data };
    }
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      kind: classifyError(err),
      error: err instanceof Error ? err : new Error(String(err))
    };
  }
}
