export default class {
  constructor() {
    this._map = new Map();
  }

  get(key) {
    if (!this._map.has(key)) {
      this._map.set(key, []);
    }

    return this._map.get(key);
  }

  has(key) {
    return Array.isArray(this._map.get(key));
  }

  set(key, ...values) {
    let data = this.get(key);
    this._map.set(key, data.concat(...values));

    return this;
  }

  remove(key) {
    this._map.set(key, []);
  }

  move(old, key) {
    this._map.set(key, this._map.get(old));
    this._map.remove(old);
  }
}