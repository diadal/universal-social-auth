import CookieStorage from './storage/cookie-storage'
import LocalStorage from './storage/local-storage'
import MemoryStorage from './storage/memory-storage'
import SessionStorage from './storage/session-storage'
import { OptionsA } from './utils'

export default function StorageFactory (options: { storageType: string; storageNamespace: null; cookieStorage: OptionsA }) {
  switch (options.storageType) {
    case 'localStorage':
      try {
        window.localStorage.setItem('testKey', 'test')
        window.localStorage.removeItem('testKey')
        return new LocalStorage(options.storageNamespace)
      } catch (e) {}

    case 'sessionStorage':
      try {
        window.sessionStorage.setItem('testKey', 'test')
        window.sessionStorage.removeItem('testKey')
        return new SessionStorage(options.storageNamespace)
      } catch (e) {}

    case 'cookieStorage':
      return new CookieStorage(options.cookieStorage)

    case 'memoryStorage':
    default:
      return new MemoryStorage(options.storageNamespace)
  }
}
