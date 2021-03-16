/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prefer-rest-params */

interface KeyB {
  [x: string]: string | boolean| Record<string, unknown>| unknown[];
}
// interface Key {
//   [x: string]: Date;
// }
export interface OptionsA {

  [x: string]: string | boolean | null | undefined | Date;
  domain?: string | undefined;
  expires?: null | undefined | Date;
  path?: string | undefined;
  secure?: boolean | undefined;
}
export interface ProviderA {

  [x: string]: string [];
}
// interface A {
export interface Provider {

  providers : ProviderA
}
// interface A {

// }

if (typeof Object.assign !== 'function') {
  Object.assign = function (target: unknown) {
    'use strict'
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object')
    }

    const to: IArguments = <IArguments>Object(target)

    for (let index = 1; index < arguments.length; index++) {
      const nextSource: IArguments = <IArguments>arguments[index]

      if (nextSource != null) {
        // Skip over if undefined or null
        for (const nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey]
          }
        }
      }
    }
    return to
  }
}

export function camelCase (name: string) {
  return name.replace(/([:\-_]+(.))/g, function (
    _: unknown,
    _separator: unknown,
    letter: string,
    offset: unknown
  ) {
    return offset ? letter.toUpperCase() : letter
  })
}

export function isUndefined (value: undefined) {
  return typeof value === 'undefined'
}

export function isDefined (value: string[]) {
  return typeof value !== 'undefined'
}

export function isObject (value: Record<string, unknown>) {
  return value !== null && typeof value === 'object'
}

export function isString (value: string) {
  return typeof value === 'string'
}

export function isNumber (value: number) {
  return typeof value === 'number'
}

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
export function joinUrl (baseUrl: string, url: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(url)) {
    return url
  }
  const joined = [baseUrl, url].join('/')
  const normalize = function (str: string) {
    return str
      .replace(/[/]+/g, '/')
      .replace(/\/\?/g, '?')
      .replace(/\/#/g, '#')
      .replace(/:\//g, '://')
  }
  return normalize(joined)
}

/**
 * Get full path based on current location
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {Location} location
 * @return {String}
 */
export function getFullUrlPath (location: Location | HTMLAnchorElement): string {
  const isHttps = location.protocol === 'https:'
  return (
    location.protocol +
    '//' +
    location.hostname +
    ':' +
    (location.port || (isHttps ? '443' : '80')) +
    (/^\//.test(location.pathname)
      ? location.pathname
      : '/' + location.pathname)
  )
}

/**
 * Parse query string variables
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {String} Query string
 * @return {String | Boolean}
 */
export function parseQueryString (str: string): KeyB {
  const obj: KeyB = {}
  let key
  let value;
  (str || '').split('&').forEach((keyValue: string) => {
    if (keyValue) {
      value = keyValue.split('=')
      key = decodeURIComponent(value[0])
      obj[key] = value[1] ? decodeURIComponent(value[1]) : true
    }
  })
  return obj
}

/**
 * Decode base64 string *
 * @param  {String} str base64 encoded string
 * @return {Object}
 */
export function decodeBase64 (base64: string): string {
  // const base64 = str;

  // create a buffer
  const buff = Buffer.from(base64, 'base64')

  // decode buffer as UTF-8
  const str = buff.toString('utf-8')

  return str
}

export function parseCookies (str: string) {
  if (str.length === 0) return {}
  const parsed: KeyB = {}
  // eslint-disable-next-line prefer-regex-literals
  const pattern = new RegExp('\\s*;\\s*')
  str.split(pattern).forEach(i => {
    const [encodedKey, encodedValue] = i.split('=')
    const key = decodeURIComponent(encodedKey)
    const value = decodeURIComponent(encodedValue)
    parsed[key] = value
  })
  return parsed
}

export function formatOptions (options: any) {
  const { path, domain, expires, secure } = options
  const exp = <Date> expires
  const Path = <string> path
  const Domain = <string> domain
  return [
    typeof path === 'undefined' || path === null ? '' : ';path=' + Path,
    typeof domain === 'undefined' || domain === null ? '' : ';domain=' + Domain,
    typeof expires === 'undefined' || expires === null
      ? ''
      : ';expires=' + exp.toUTCString(),
    typeof secure === 'undefined' || secure === null || secure === false
      ? ''
      : ';secure'
  ].join('')
}

export function formatCookie (
  key: string | number,
  value: string,
  options: any
) {
  return [
    encodeURIComponent(key),
    '=',
    encodeURIComponent(value),
    formatOptions(options)
  ].join('')
}
