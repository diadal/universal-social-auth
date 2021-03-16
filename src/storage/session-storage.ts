class LocalStorage {
  namespace: null
  constructor (namespace: null) {
    this.namespace = namespace || null
  }

  setItem (key: string, value: string) {
    window.sessionStorage.setItem(this._getStorageKey(key), value)
  }

  getItem (key: string) {
    return window.sessionStorage.getItem(this._getStorageKey(key))
  }

  removeItem (key: string) {
    window.sessionStorage.removeItem(this._getStorageKey(key))
  }

  _getStorageKey (key: string) {
    if (this.namespace) {
      return [this.namespace, key].join('.')
    }
    return key
  }
}

export default LocalStorage
