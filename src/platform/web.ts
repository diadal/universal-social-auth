import OAuthPopup from '../oauth/popup';
import type { AuthSession, PlatformAdapter } from './types';

class WebAuthSession implements AuthSession {
  private readonly popup: OAuthPopup;

  constructor(url: string, name: string, popupOptions: Record<string, unknown>) {
    this.popup = new OAuthPopup(url, name, popupOptions);
  }

  open(redirectUri: string, skipPooling: boolean, timeoutMs?: number) {
    return this.popup.open(redirectUri, skipPooling, timeoutMs);
  }

  navigate(url: string): Promise<boolean> {
    const handle = this.popup.popup;
    if (!handle) return Promise.resolve(false);
    handle.location.href = url;
    return Promise.resolve(true);
  }

  waitForCallback(redirectUri: string, timeoutMs?: number) {
    return this.popup.pooling(redirectUri, timeoutMs);
  }

  close(): void {
    this.popup.popup?.close();
  }
}

export const webPlatform: PlatformAdapter = {
  kind: 'web',
  platform: 'web',
  createSession: (url, name, popupOptions) =>
    new WebAuthSession(url, name, popupOptions)
};
