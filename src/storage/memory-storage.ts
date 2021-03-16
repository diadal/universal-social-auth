class MemoryStorage {
  namespace: null
  _storage: Record<string, unknown>
  constructor (namespace: null) {
    this.namespace = namespace || null
    this._storage = {}
  }

  setItem (key: string, value: string) {
    this._storage[this._getStorageKey(key)] = value
  }

  getItem (key: string) {
    return this._storage[this._getStorageKey(key)]
  }

  removeItem (key: string) {
    delete this._storage[this._getStorageKey(key)]
  }

  _getStorageKey (key: string) {
    if (this.namespace) {
      return [this.namespace, key].join('.')
    }
    return key
  }
}

export default MemoryStorage
