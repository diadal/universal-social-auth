import CookieStorage from './storage/cookie-storage'
import LocalStorage from './storage/local-storage'
import MemoryStorage from './storage/memory-storage'
import SessionStorage from './storage/session-storage'
import { OptionsA } from './utils'

function isStorageAvailable (getStorage: () => Storage): boolean {
  try {
    const storage = getStorage()
    storage.setItem('testKey', 'test')
    storage.removeItem('testKey')
    return true
  } catch {
    return false
  }
}

export default function StorageFactory (options: { storageType: string; storageNamespace: null; cookieStorage: OptionsA }) {
  switch (options.storageType) {
    case 'localStorage':
      if (isStorageAvailable(() => window.localStorage)) {
        return new LocalStorage(options.storageNamespace)
      }
      if (isStorageAvailable(() => window.sessionStorage)) {
        return new SessionStorage(options.storageNamespace)
      }
      return new CookieStorage(options.cookieStorage)

    case 'sessionStorage':
      if (isStorageAvailable(() => window.sessionStorage)) {
        return new SessionStorage(options.storageNamespace)
      }
      return new CookieStorage(options.cookieStorage)

    case 'cookieStorage':
      return new CookieStorage(options.cookieStorage)

    case 'memoryStorage':
    default:
      return new MemoryStorage(options.storageNamespace)
  }
}
