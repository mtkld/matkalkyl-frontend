class Mutex {
  constructor() {
    this._lock = Promise.resolve();
  }

  lock() {
    let unlockNext;
    const willLock = new Promise((resolve) => (unlockNext = resolve));
    const unlock = () => unlockNext(); // 🔓 this releases the lock
    const lockPromise = this._lock.then(() => unlock);
    this._lock = lockPromise;
    return lockPromise; // resolves to unlock function
  }
}

class Pipe {
  constructor(path = "", logger = null) {
    this._pipeData = {
      queue: [],
      listenerPositions: new Map(), // Map to track uniqueId and their positions
      waitingPromises: new Map(), // Map to track uniqueId and their resolve functions
    };
    this._path = path || "";
    this._logger = this._logger = {
      log: typeof logger === "function" ? logger : (msg) => console.log(msg),
    };
    this._mutex = new Mutex(); // Mutex for controlling access

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (
          prop === "get" ||
          prop === "set" ||
          prop === "_get" ||
          prop === "_set"
        ) {
          return target[prop].bind(target);
        }

        if (!(prop in target)) {
          target[prop] = new Pipe(
            `${this._path}${this._path ? "." : ""}${prop}`,
            this._logger,
          );
        }
        return target[prop];
      },
    });
  }

  _initializePipe() {
    if (!this._pipeData) {
      this._pipeData = {
        queue: [],
        listenerPositions: new Map(), // Initialize the Map for tracking listener positions
        waitingPromises: new Map(), // Initialize the Map for tracking resolve functions
      };
    }
  }

  // If no new data is available, set a new promise with resolve function
  async _get(uniqueId) {
    const unlock = await this._mutex.lock();
    try {
      this._initializePipe();

      let position = this._pipeData.listenerPositions.get(uniqueId);
      if (position === undefined) {
        position = this._pipeData.queue.length;
      }

      const currentItem = this._pipeData.queue[position];
      if (currentItem !== undefined) {
        this._pipeData.listenerPositions.set(uniqueId, position + 1);
        this._clearOldData();
        return currentItem;
      }

      // ✅ Re-checked inside mutex: no data => now wait
      return new Promise((resolve) => {
        console.log(
          `[${this._path}] GET: no data, waiting from position ${position} for ${uniqueId}`,
        );
        // keep cursor at *current* position so set() can detect it
        this._pipeData.listenerPositions.set(uniqueId, position);
        this._pipeData.waitingPromises.set(uniqueId, resolve);
      });
    } finally {
      unlock(); // ✅ release mutex
    }
  }

  async _set(data) {
    const unlock = await this._mutex.lock(); // ✅ acquire
    try {
      this._initializePipe();

      this._pipeData.queue.push(data);
      const lastPosition = this._pipeData.queue.length - 1;

      for (const [
        uniqueId,
        position,
      ] of this._pipeData.listenerPositions.entries()) {
        if (position < this._pipeData.queue.length) {
          const resolve = this._pipeData.waitingPromises.get(uniqueId);
          if (typeof resolve === "function") {
            resolve(this._pipeData.queue[position]);
            this._pipeData.listenerPositions.set(uniqueId, position + 1);
            this._pipeData.waitingPromises.delete(uniqueId);
          }
        }
      }

      this._clearOldData();
      return lastPosition;
    } finally {
      unlock(); // ✅ correct release
    }
  }

  async get(uniqueId) {
    // To prevent two listeners registering same pipe

    // NOTE: This is wrong, the system was designed to allow identification across multiple get(). Thats the point, so we know who should have what.
    //    if (this._pipeData.listenerPositions.has(uniqueId)) {
    //      this._logger.log(
    //        `[${this._path}] ❌ Duplicate listener use of uniqueId "${uniqueId}"`,
    //      );
    //      throw new Error(
    //        `[${this._path}] ❌ Duplicate listener use of uniqueId "${uniqueId}"`,
    //      );
    //    }

    this._logger.log(
      `[${this._path}] GET: looking for data for ${uniqueId}...`,
    );
    const result = await this._get(uniqueId);
    this._logger.log(
      `[${this._path}] GET: ${result ? "read" : "listening"} for ${uniqueId}`,
    );

    return result;
  }

  async set(data) {
    const listenersWaitingToBeResolved = this._pipeData.waitingPromises.size;
    const insertPos = await this._set(data);
    this._logger.log(`[${this._path}] SET: written at position ${insertPos}`);
    this._logger.log(
      `[${this._path}] SET: ${listenersWaitingToBeResolved} listeners resolved`,
    );
  }

  _clearOldData() {
    const { queue, listenerPositions } = this._pipeData;
    if (!queue.length) return;

    // find how many leading entries every listener has already passed
    const minPos = Math.min(...listenerPositions.values(), queue.length);

    if (minPos > 0) {
      queue.splice(0, minPos); // compact the array
      // shift every listener cursor back by minPos
      for (const [id, pos] of listenerPositions) {
        listenerPositions.set(id, pos - minPos);
      }
    }
  }

  async clearUniqueId(uniqueId) {
    const unlock = await this._mutex.lock();
    //
    try {
      console.log(`entering clearUniqueId to cleare ${uniqueId}`);
      this._initializePipe();
      // Remove the uniqueId from listenerPositions map
      if (this._pipeData.listenerPositions.has(uniqueId)) {
        console.log(
          `listenerPositions has uniqueId: ${uniqueId}, running delete on it`,
        );
        this._pipeData.listenerPositions.delete(uniqueId);
        this._logger.log(
          `[${this._path}] Cleared listener position for ${uniqueId}`,
        );
      }

      // Remove the uniqueId from waitingPromises map
      if (this._pipeData.waitingPromises.has(uniqueId)) {
        this._pipeData.waitingPromises.delete(uniqueId);
        this._logger.log(
          `[${this._path}] Cleared waiting promise for ${uniqueId}`,
        );
      }
    } finally {
      unlock(); // Release the lock
    }
  }
}
