export default class OAuthPopup {
    popupOptions: Record<string, unknown>;
    popup: Window | null;
    url: string;
    name: string;
    constructor(url: string, name: string, popupOptions: Record<string, unknown>);
    open(redirectUri: string, skipPooling: boolean): Promise<unknown>;
    pooling(redirectUri: string): Promise<unknown>;
    _stringifyOptions(): string;
}
