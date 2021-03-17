declare class CookieStorage {
    _defaultOptions: Record<string, unknown>;
    constructor(defaultOptions: Record<string, unknown>);
    setItem(key: string, value: string): void;
    getItem(key: string | number): string | boolean | Record<string, unknown> | null;
    removeItem(key: string | number): void;
    _getCookie(): string;
    _setCookie(cookie: string): void;
}
export default CookieStorage;
