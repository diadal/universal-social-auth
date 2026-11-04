import OAuthPopup from '../oauth/popup';
import { AuthError } from '../errors';

async function kindOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return 'resolved';
  } catch (err) {
    return err instanceof AuthError ? err.kind : 'other';
  }
}

function fakeWindow(overrides: Record<string, unknown> = {}) {
  return {
    closed: false,
    focus: jest.fn(),
    close: jest.fn(),
    location: { href: 'about:blank', search: '', hash: '' },
    ...overrides
  };
}

describe('OAuthPopup', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('rejects with popup_blocked when the browser returns no window', async () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    const popup = new OAuthPopup('https://auth.example.com', 'google', {});
    expect(await kindOf(popup.open('http://localhost/cb', false))).toBe(
      'popup_blocked'
    );
  });

  it('reports a closed window as cancelled', async () => {
    jest
      .spyOn(window, 'open')
      .mockReturnValue(fakeWindow({ closed: true }) as unknown as Window);
    const popup = new OAuthPopup('https://auth.example.com', 'google', {});
    expect(await kindOf(popup.open('http://localhost/cb', false))).toBe(
      'cancelled'
    );
  });

  it('times out and closes the popup when no callback arrives', async () => {
    jest.useFakeTimers();
    const win = fakeWindow();
    jest.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
    const popup = new OAuthPopup('https://auth.example.com', 'google', {});
    const outcome = kindOf(popup.open('http://localhost/cb', false, 1000));
    await jest.advanceTimersByTimeAsync(1500);
    expect(await outcome).toBe('timeout');
    expect(win.close).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('uses the default timeout when no override is provided', async () => {
    jest.useFakeTimers();
    const win = fakeWindow();
    jest.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
    const popup = new OAuthPopup('https://auth.example.com', 'google', {});
    const outcome = kindOf(popup.open('http://localhost/cb', false));

    await jest.advanceTimersByTimeAsync(5 * 60 * 1000 + 250);

    expect(await outcome).toBe('timeout');
    expect(win.close).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('rejects invalid timeout overrides without opening a popup', async () => {
    const open = jest.spyOn(window, 'open');
    const popup = new OAuthPopup('https://auth.example.com', 'google', {});

    expect(await kindOf(popup.open('http://localhost/cb', false, 0))).toBe('config');
    expect(await kindOf(popup.open('http://localhost/cb', false, Infinity))).toBe(
      'config'
    );
    expect(open).not.toHaveBeenCalled();
  });

  it('maps access_denied on the redirect to cancelled', async () => {
    const redirect = document.createElement('a');
    redirect.href = 'http://localhost/cb?error=access_denied';
    jest
      .spyOn(window, 'open')
      .mockReturnValue(fakeWindow({ location: redirect }) as unknown as Window);
    const popup = new OAuthPopup('https://auth.example.com', 'google', {});
    expect(await kindOf(popup.open('http://localhost/cb', false))).toBe(
      'cancelled'
    );
  });
});
