import { parseQueryString, getFullUrlPath, isUndefined } from '../utils';

export default class OAuthPopup {
  popupOptions: Record<string, unknown>;
  popup: Window | null;
  url: string;
  name: string;
  constructor(
    url: string,
    name: string,
    popupOptions: Record<string, unknown>
  ) {
    this.popup = null;
    this.url = url;
    this.name = name;
    this.popupOptions = popupOptions;
  }

  open(redirectUri: string, skipPooling: boolean) {
    try {
      this.popup = window.open(this.url, this.name, this._stringifyOptions());
      if (this.popup && this.popup.focus) {
        this.popup.focus();
      }

      if (skipPooling) {
        return Promise.resolve();
      } else {
        const pool = this.pooling(redirectUri);

        return pool;
      }
    } catch (e) {
      return Promise.reject(new Error('OAuth popup error occurred'));
    }
  }

  pooling(redirectUri: string) {
    return new Promise((resolve: (value: unknown) => void, reject) => {
      const redirectUriParser = document.createElement('a');
      redirectUriParser.href = redirectUri;
      const redirectUriPath = getFullUrlPath(redirectUriParser);

      let poolingInterval = window.setInterval(() => {
        if (
          !this.popup ||
          this.popup.closed ||
          this.popup.closed === undefined
        ) {
          clearInterval(poolingInterval);
          poolingInterval = 0;
          reject('Auth popup window closed');
        }

        try {
          const location = <Window>this.popup;

          const popupWindowPath = getFullUrlPath(location.location);
          if (popupWindowPath === redirectUriPath) {
            if (location.location.search || location.location.hash) {
              const query = parseQueryString(
                location.location.search.substring(1).replace(/\/$/, '')
              );
              const hash = parseQueryString(
                location.location.hash.substring(1).replace(/[/$]/, '')
              );
              const params = {
                ...query,
                ...hash
              };
              if (params.error) {
                reject(<string>params.error);
              } else {
                resolve(params);
              }
            } else {
              reject(
                'OAuth redirect has occurred but no query or hash parameters were found.'
              );
            }

            clearInterval(poolingInterval);
            poolingInterval = 0;
            location.close();
          }
        } catch (e) {
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

// function reject(arg0: Error) {
//   throw new Error(`Function not implemented. ${<string>(<unknown>arg0)}`);
// }
