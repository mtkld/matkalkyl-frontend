// d:01986e3e-6988-737d-80d5-df2a011a1fca
export class UserIndexDB {
  constructor(userID, pluginID) {
    this.dbName = `${userID}-${pluginID}`;
    this.userID = userID;
    this.pluginID = pluginID;
  }

  async getStore(storeName) {
    const store = new IndexDB(this.dbName, storeName);
    await store.open(this.userID);
    return store;
  }

  async deleteStore(storeName) {
    const store = new IndexDB(this.dbName, storeName);
    return await store.deleteStore();
  }

  async deleteDatabase() {
    const store = new IndexDB(this.dbName, null); // storeName not required
    return await store.deleteDatabase();
  }

  async listStores() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const storeNames = Array.from(db.objectStoreNames);
        db.close();
        resolve(storeNames);
      };
      request.onerror = () => reject(request.error);
    });
  }
  closeDatabase() {
    const store = new IndexDB(this.dbName, this.pluginID); // storeName doesn’t matter
    store.closeDatabase();
  }
}
