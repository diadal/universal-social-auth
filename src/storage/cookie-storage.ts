/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { OptionsA } from './../utils'
import {
  formatCookie,
  parseCookies
} from '../utils'

class CookieStorage {
  _defaultOptions: Record<string, unknown>
  constructor (defaultOptions: Record<string, unknown>) {
    const def = {
      domain: window.location.hostname,
      expires: null,
      path: '/',
      secure: false
    }
    this._defaultOptions = {
      ...def,
      ...defaultOptions
    }
  }

  setItem (key: string, value: string) {
    const options = {
      ...this._defaultOptions
    }
    const cookie = formatCookie(key, value, options)
    this._setCookie(cookie)
  }

  getItem (key: string | number) {
    const cookies = parseCookies(this._getCookie())
    return (cookies[key] !== undefined) ? cookies[key] : null
  }

  removeItem (key: string | number) {
    const value = ''
    const defaultOptions = { ...this._defaultOptions }
    const options = { ...defaultOptions, expires: new Date(0) }
    const cookie = formatCookie(key, value, options)
    this._setCookie(cookie)
  }

  _getCookie () {
    return typeof document === 'undefined'
      ? '' : typeof document.cookie === 'undefined'
        ? '' : document.cookie
  }

  _setCookie (cookie: string) {
    document.cookie = cookie
  }
}

export default CookieStorage
