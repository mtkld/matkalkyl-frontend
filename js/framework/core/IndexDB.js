// d:019869ec-f898-7fd6-964d-b21634124e29
export class IndexDB {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this._db = null;
    this.data = {}; // Client-controlled mutable data
  }

  async open() {
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
    if (!this._db) throw new Error("Store not opened");

    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);

      store.put(this.data);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async load(id) {
    if (!this._db) throw new Error("Store not opened");

    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).get(id);

      req.onsuccess = () => {
        this.data = req.result ? { ...req.result } : {};
        resolve(this.data);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteStore() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const version = db.version + 1;
        db.close();

        const upgradeRequest = indexedDB.open(this.dbName, version);
        upgradeRequest.onupgradeneeded = (e) => {
          const upgradedDb = e.target.result;
          if (upgradedDb.objectStoreNames.contains(this.storeName)) {
            upgradedDb.deleteObjectStore(this.storeName);
          }
        };
        upgradeRequest.onsuccess = () => {
          upgradeRequest.result.close();
          resolve(true);
        };
        upgradeRequest.onerror = () => reject(upgradeRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  closeDatabase() {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }
}
