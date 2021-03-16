declare class LocalStorage {
    namespace: null;
    constructor(namespace: null);
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    _getStorageKey(key: string): string;
}
export default LocalStorage;
