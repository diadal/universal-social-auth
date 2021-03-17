export interface KeyB {
    [x: string]: string | boolean | Record<string, unknown>;
}
export interface OptionsA {
    [x: string]: string | boolean | null | undefined | Date;
    domain?: string | undefined;
    expires?: null | undefined | Date;
    path?: string | undefined;
    secure?: boolean | undefined;
}
export interface ProviderA {
    [x: string]: string[];
}
export interface Provider {
    providers: ProviderA;
}
export declare function camelCase(name: string): string;
export declare function isUndefined(value: undefined): boolean;
export declare function isDefined(value: string[]): boolean;
export declare function isObject(value: Record<string, unknown>): boolean;
export declare function isString(value: string): boolean;
export declare function isNumber(value: number): boolean;
export declare function joinUrl(baseUrl: string, url: string): string;
export declare function getFullUrlPath(location: Location | HTMLAnchorElement): string;
export declare function parseQueryString(str: string): KeyB;
export declare function decodeBase64(base64: string): string;
export declare function parseCookies(str: string): KeyB;
export declare function formatOptions(options: Record<string, unknown>): string;
export declare function formatCookie(key: string | number, value: string, options: Record<string, unknown>): string;
