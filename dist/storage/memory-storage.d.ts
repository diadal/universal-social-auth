declare class MemoryStorage {
    namespace: null;
    _storage: Record<string, unknown>;
    constructor(namespace: null);
    setItem(key: string, value: string): void;
    getItem(key: string): unknown;
    removeItem(key: string): void;
    _getStorageKey(key: string): string;
}
export default MemoryStorage;
