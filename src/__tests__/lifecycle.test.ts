/**
 * @jest-environment jsdom
 */
import UniversalSocialauth from '../authenticate';
import OAuth2 from '../oauth/oauth2';
import { AuthError } from '../errors';
import { Providers } from '../providers';

jest.mock('../oauth/oauth2');

const MockedOAuth2 = OAuth2 as unknown as jest.Mock;

// `Providers` is typed with a broad index signature, so cast to the param type.
const google = Providers.google as never;

function build(hooks: Record<string, unknown>) {
  const http = { interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } };
  return new UniversalSocialauth(http as never, { hooks });
}

function mockInit(impl: () => Promise<unknown>) {
  MockedOAuth2.mockImplementation(() => ({ init: impl }));
}

describe('lifecycle hooks in authenticate()', () => {
  beforeEach(() => {
    MockedOAuth2.mockReset();
  });

  it('emits start and complete for a successful popup login', async () => {
    mockInit(async () => ({ code: 'abc' }));
    const hooks = { onStart: jest.fn(), onComplete: jest.fn(), onCancel: jest.fn(), onError: jest.fn() };
    const auth = build(hooks);

    await auth.authenticate('google', google);

    expect(hooks.onStart).toHaveBeenCalledWith({ provider: 'google' });
    expect(hooks.onComplete).toHaveBeenCalledWith({ provider: 'google' });
    expect(hooks.onCancel).not.toHaveBeenCalled();
    expect(hooks.onError).not.toHaveBeenCalled();
  });

  it('emits cancel when the user closes the popup', async () => {
    mockInit(async () => {
      throw new AuthError('cancelled', 'popup closed');
    });
    const hooks = { onStart: jest.fn(), onComplete: jest.fn(), onCancel: jest.fn(), onError: jest.fn() };
    const auth = build(hooks);

    const result = await auth.authenticate('google', google);

    expect(result).toBeInstanceOf(Error);
    expect(hooks.onCancel).toHaveBeenCalledWith({ provider: 'google' });
    expect(hooks.onError).not.toHaveBeenCalled();
  });

  it('emits error with a kind and no message or payload', async () => {
    mockInit(async () => {
      throw new AuthError('state_mismatch', 'OAuth state mismatch with secret-value');
    });
    const hooks = { onError: jest.fn() };
    const auth = build(hooks);

    await auth.authenticate('google', google);

    expect(hooks.onError).toHaveBeenCalledWith({ provider: 'google', kind: 'state_mismatch' });
    expect(JSON.stringify(hooks.onError.mock.calls)).not.toContain('secret-value');
  });

  it('keeps the login result when an observer throws', async () => {
    mockInit(async () => ({ code: 'abc' }));
    const auth = build({
      onStart: () => {
        throw new Error('observer failure');
      }
    });

    await expect(auth.authenticate('google', google)).resolves.toEqual({ code: 'abc' });
  });
});
