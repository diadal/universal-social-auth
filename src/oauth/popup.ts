import { parseQueryString, getFullUrlPath, isUndefined } from '../utils';
import { AuthError } from '../errors';

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
        const pool = this.pooling(redirectUri, timeoutMs);
        return pool;
      }
    } catch {
      return Promise.reject(new AuthError('unknown', 'OAuth popup error occurred'));
    }
  }

  pooling(redirectUri: string, timeoutMs?: number) {
    return new Promise((resolve: (value: unknown) => void, reject) => {
      const redirectUriParser = document.createElement('a');
      redirectUriParser.href = redirectUri;
      const redirectUriPath = getFullUrlPath(redirectUriParser);
      const deadline = timeoutMs ? Date.now() + timeoutMs : 0;

      let poolingInterval = <number>(<unknown>setInterval(() => {
        if (
          !this.popup ||
          this.popup.closed ||
          this.popup.closed === undefined
        ) {
          clearInterval(poolingInterval);
          poolingInterval = 0;
          reject(new AuthError('cancelled', 'Auth popup window closed'));
          return;
        }

        if (deadline && Date.now() > deadline) {
          clearInterval(poolingInterval);
          poolingInterval = 0;
          this.popup.close();
          reject(new AuthError('timeout', 'Auth popup timed out'));
          return;
        }

        try {
          const location = <Window>this.popup;

          const popupWindowPath = getFullUrlPath(location.location);
          if (popupWindowPath === redirectUriPath) {
            if (location.location.search || location.location.hash) {
              const query = parseQueryString(
                location.location.search.substring(1)
              );
              const hash = parseQueryString(
                location.location.hash.substring(1)
              );
              const params = {
                ...query,
                ...hash
              };
              clearInterval(poolingInterval);
              poolingInterval = 0;
              location.close();
              if (params.error) {
                reject(
                  params.error === 'access_denied'
                    ? new AuthError('cancelled', 'Authorization was denied')
                    : new AuthError('provider', 'OAuth provider returned an error')
                );
              } else {
                resolve(params);
              }
            } else {
              clearInterval(poolingInterval);
              poolingInterval = 0;
              location.close();
              reject(
                new AuthError(
                  'provider',
                  'OAuth redirect has occurred but no query or hash parameters were found.'
                )
              );
            }
          }
        } catch (e) {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        }
      }, 250));
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
