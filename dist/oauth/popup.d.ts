export default class OAuthPopup {
    popupOptions: Record<string, unknown>;
    popup: Window | null;
    url: string;
    name: string;
    constructor(url: string, name: string, popupOptions: Record<string, unknown>);
    open(redirectUri: string, skipPooling: boolean, timeoutMs?: number): Promise<unknown>;
    pooling(redirectUri: string, timeoutMs?: number): Promise<unknown>;
    _stringifyOptions(): string;
}
