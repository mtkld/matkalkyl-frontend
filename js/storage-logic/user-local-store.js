class UserLocalStore {
  constructor() {
    this.dbName = "MKLocalDB";
    this.storeName = "users";
    this.userId = null;
    this.data = {}; // mutable user-facing object
  }

  async open(userId) {
    this.userId = userId;
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    this._db = db;
  }

  async save() {
    if (!this.userId || !this._db)
      throw new Error("UserStore not opened with ID");

    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);

      const toSave = { id: this.userId, ...this.data };
      store.put(toSave);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async load() {
    if (!this.userId || !this._db)
      throw new Error("UserStore not opened with ID");

    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).get(this.userId);

      req.onsuccess = () => {
        this.data = req.result ? { ...req.result } : {};
        resolve(this.data);
      };
      req.onerror = () => reject(req.error);
    });
  }
}
