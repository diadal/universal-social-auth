export default class OAuthPopup {
    popupOptions: Record<string, string | undefined>;
    popup: any;
    url: string;
    name: string;
    constructor(url: string, name: string, popupOptions: Record<string, string | undefined>);
    open(redirectUri: string, skipPooling: boolean): Promise<unknown>;
    pooling(redirectUri: string): Promise<unknown>;
    _stringifyOptions(): string;
}
