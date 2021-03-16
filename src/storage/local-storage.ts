class LocalStorage {
  namespace: null
  constructor (namespace: null) {
    this.namespace = namespace || null
  }

  setItem (key: string, value: string) {
    window.localStorage.setItem(this._getStorageKey(key), value)
  }

  getItem (key: string) {
    return window.localStorage.getItem(this._getStorageKey(key))
  }

  removeItem (key: string) {
    window.localStorage.removeItem(this._getStorageKey(key))
  }

  _getStorageKey (key: string) {
    if (this.namespace) {
      return [this.namespace, key].join('.')
    }
    return key
  }
}

export default LocalStorage
