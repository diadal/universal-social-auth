declare class CookieStorage {
    _defaultOptions: any;
    constructor(defaultOptions: any);
    setItem(key: string, value: string): void;
    getItem(key: string | number): string | boolean | Record<string, unknown> | unknown[] | null;
    removeItem(key: string | number): void;
    _getCookie(): string;
    _setCookie(cookie: string): void;
}
export default CookieStorage;
