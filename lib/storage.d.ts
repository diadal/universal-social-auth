import CookieStorage from './storage/cookie-storage';
import LocalStorage from './storage/local-storage';
import MemoryStorage from './storage/memory-storage';
import SessionStorage from './storage/session-storage';
import { OptionsA } from './utils';
export default function StorageFactory(options: {
    storageType: any;
    storageNamespace: null;
    cookieStorage: OptionsA;
}): LocalStorage | SessionStorage | CookieStorage | MemoryStorage;
