import { parseQueryString, getFullUrlPath, isUndefined } from '../utils';
import { AuthError } from '../errors';

const DEFAULT_POPUP_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Reads the OAuth callback from the popup's URL. Returns the query/hash params,
 * or the AuthError that should reject the sign-in.
 */
function parseRedirectResult(location: Location): AuthError | Record<string, unknown> {
  if (!location.search && !location.hash) {
    return new AuthError(
      'provider',
      'OAuth redirect has occurred but no query or hash parameters were found.'
    );
  }
  const params = {
    ...parseQueryString(location.search.substring(1)),
    ...parseQueryString(location.hash.substring(1))
  };
  if (!params.error) {
    return params;
  }
  return params.error === 'access_denied'
    ? new AuthError('cancelled', 'Authorization was denied')
    : new AuthError('provider', 'OAuth provider returned an error');
}

export default class OAuthPopup {
  popupOptions: Record<string, unknown>;
  popup: Window | null = null;
  url: string;
  name: string;
  constructor(
    url: string,
    name: string,
    popupOptions: Record<string, unknown>
  ) {
    this.url = url;
    this.name = name;
    this.popupOptions = popupOptions;
  }

  open(redirectUri: string, skipPooling: boolean, timeoutMs?: number) {
    const effectiveTimeoutMs = timeoutMs ?? DEFAULT_POPUP_TIMEOUT_MS;
    if (!Number.isFinite(effectiveTimeoutMs) || effectiveTimeoutMs <= 0) {
      return Promise.reject(
        new AuthError('config', 'callbackTimeout must be a positive finite number')
      );
    }

    try {
      this.popup = window.open(this.url, this.name, this._stringifyOptions());
      if (!this.popup) {
        return Promise.reject(
          new AuthError('popup_blocked', 'Auth popup was blocked by the browser')
        );
      }
      if (this.popup.focus) {
        this.popup.focus();
      }

      if (skipPooling) {
        return Promise.resolve();
      } else {
        const pool = this.pooling(redirectUri, effectiveTimeoutMs);
        return pool;
      }
    } catch {
      return Promise.reject(new AuthError('unknown', 'OAuth popup error occurred'));
    }
  }

  pooling(redirectUri: string, timeoutMs?: number) {
    const effectiveTimeoutMs = timeoutMs ?? DEFAULT_POPUP_TIMEOUT_MS;
    if (!Number.isFinite(effectiveTimeoutMs) || effectiveTimeoutMs <= 0) {
      return Promise.reject(
        new AuthError('config', 'callbackTimeout must be a positive finite number')
      );
    }

    return new Promise((resolve: (value: unknown) => void, reject) => {
      const redirectUriParser = document.createElement('a');
      redirectUriParser.href = redirectUri;
      const redirectUriPath = getFullUrlPath(redirectUriParser);
      const deadline = Date.now() + effectiveTimeoutMs;
      let poolingInterval = 0;

      const settle = (outcome: AuthError | Record<string, unknown>) => {
        window.clearInterval(poolingInterval);
        poolingInterval = 0;
        if (outcome instanceof AuthError) {
          reject(outcome);
        } else {
          resolve(outcome);
        }
      };

      poolingInterval = window.setInterval(() => {
        const popup = this.popup;
        if (!popup || popup.closed || popup.closed === undefined) {
          settle(new AuthError('cancelled', 'Auth popup window closed'));
          return;
        }

        if (deadline && Date.now() > deadline) {
          popup.close();
          settle(new AuthError('timeout', 'Auth popup timed out'));
          return;
        }

        try {
          if (getFullUrlPath(popup.location) !== redirectUriPath) {
            return;
          }
          const outcome = parseRedirectResult(popup.location);
          popup.close();
          settle(outcome);
        } catch {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        }
      }, 250);
    });
  }

  _stringifyOptions() {
    const options: string[] = [];
    const Popup = this.popupOptions;

    for (const optionKey in Popup) {
      if (!isUndefined(<undefined>Popup[optionKey])) {
        options.push(`${optionKey}=${<string>Popup[optionKey]}`);
      }
    }
    return options.join(',');
  }
}
