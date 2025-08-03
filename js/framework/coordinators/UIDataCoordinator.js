// d:01983629-da4a-74ef-b536-b3f94f0d11c8
export class UIDataCoordinator {
  constructor() {
    this.data = new Map();
  }

  set(key, value) {
    this.data.set(key, value);
  }

  get(key) {
    return this.data.get(key);
  }

  clear(keyPrefix = null) {
    if (!keyPrefix) return this.data.clear();
    for (const key of this.data.keys()) {
      if (key.startsWith(keyPrefix)) this.data.delete(key);
    }
  }
}
