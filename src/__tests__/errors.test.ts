import { AuthError, classifyError, toOutcome } from '../errors';
import { emitHook } from '../lifecycle';

describe('toOutcome', () => {
  it('wraps a successful result', async () => {
    expect(await toOutcome(Promise.resolve(1))).toEqual({ ok: true, data: 1 });
  });

  it('keeps the kind of a thrown AuthError', async () => {
    const outcome = await toOutcome(
      Promise.reject(new AuthError('timeout', 'slow'))
    );
    expect(outcome).toMatchObject({ ok: false, kind: 'timeout' });
  });

  it('treats a resolved Error as a failure', async () => {
    const outcome = await toOutcome(
      Promise.resolve(new AuthError('config', 'bad'))
    );
    expect(outcome).toMatchObject({ ok: false, kind: 'config' });
  });

  it('reports other errors as unknown', async () => {
    const outcome = await toOutcome(Promise.reject(new Error('boom')));
    expect(outcome).toMatchObject({ ok: false, kind: 'unknown' });
    expect(classifyError(new Error('x'))).toBe('unknown');
  });
});

describe('emitHook', () => {
  it('does nothing when the hook is not defined', () => {
    expect(() =>
      emitHook(undefined, 'onStart', { provider: 'google' })
    ).not.toThrow();
  });

  it('swallows errors thrown by an observer', () => {
    const hooks = {
      onStart: () => {
        throw new Error('observer failure');
      }
    };
    expect(() => emitHook(hooks, 'onStart', { provider: 'google' })).not.toThrow();
  });
});
