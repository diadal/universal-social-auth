interface KeyB {
    [x: string]: string | boolean | Record<string, unknown> | unknown[];
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
/**
 * Assemble url from two segments
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {String} baseUrl Base url
 * @param  {String} url     URI
 * @return {String}
 */
export declare function joinUrl(baseUrl: string, url: string): string;
/**
 * Get full path based on current location
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {Location} location
 * @return {String}
 */
export declare function getFullUrlPath(location: Location | HTMLAnchorElement): string;
/**
 * Parse query string variables
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {String} Query string
 * @return {String | Boolean}
 */
export declare function parseQueryString(str: string): KeyB;
/**
 * Decode base64 string *
 * @param  {String} str base64 encoded string
 * @return {Object}
 */
export declare function decodeBase64(base64: string): string;
export declare function parseCookies(str: string): KeyB;
export declare function formatOptions(options: any): string;
export declare function formatCookie(key: string | number, value: string, options: any): string;
export {};
