const _private = Symbol("private");

// d:019869aa-8b14-7336-87f6-b4af5d95750b
export class MKFramework {
  // The MKFramework singeton instance itself.
  static _instance = null;

  // Keep record of everything we create for users of MKFramework
  static _pluginList = [];
  static _localSignalRelayList = new Map();
  static _contextList = new Map();
  static _userStorageList = [];

  constructor(secret) {
    // Prevent exteranl code from instantiating this class directly.
    // We use a factory to create a singleton instance of MKFramework.
    if (secret !== _private) {
      throw new Error(
        "Use MKFramework.getMKFramework() to create an instance.",
      );

      // The global signal relay for the user
      this.g = {};
      this.g.sig = new SignalRelay({
        USER_REGISTERED: 0,
        NETWORK_IN: 1,

        NETWORK_CONNECTION: 2,
        SWITCH_CONTEXT: 3,
      });
    }

    // Browser local storage of all users data
    this._userLocalStore = new UserLocalStore("MKIndexDB", "users");
  }

  // Singleton
  static getInstance() {
    if (!MKFramework._instance) {
      MKFramework._instance = new MKFramework(_private);
    }
    return MKFramework._instance;
  }

  //------------------------------------------------------------------------//
  //                                 Plugins                                //
  //------------------------------------------------------------------------//
  registerPlugin(plugin) {
    console.log("Not implemented yet: MKFramework.registerPlugin");
    return;
    // Ensure required methods are implemented
    for (const method of [
      "saveLocalData",
      "loadLocalData",
      "render",
      "initiate",
      "destroy",
      "indexDBUpgradePath", // Responsible for upgrading the plugin's IndexedDB schema. Deleting old data, transforming data to new structure, adding new fields, etc.
    ]) {
      if (typeof plugin[method] !== "function") {
        throw new Error(`Plugin must implement ${method} method.`);
      }
    }
    for (const prop of ["name", "version", "description"]) {
      if (typeof plugin[prop] !== "string") {
        throw new Error(`Plugin must have a ${prop} property.`);
      }
    }

    // Register the plugin
    this._pluginList.push(plugin);
  }

  unregisterPlugin(plugin) {
    console.log("Not implemented yet: MKFramework.unregisterPlugin");
  }

  // We wont return the full plugin object, but only the info that is needed
  getPluginListInfo() {
    return this._pluginList.map((plugin) => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
    }));
  }
  //------------------------------------------------------------------------//
  //                                 Context                                //
  //------------------------------------------------------------------------//
  static makeNewContext(contextType, config = {}) {
    const ctx = new Context(contextType, config);
    MKFramework._contextList.set(ctx, { contextType, config });
    return ctx;
  }
  destroyContext(context) {
    console.log("Not implemented yet: MKFramework.destroyContext");
  }

  //------------------------------------------------------------------------//
  //                               Encryption                               //
  //------------------------------------------------------------------------//
  async generateCryptoValues(password) {
    return await Encryption.secureKeyBundleInitializer(password);
  }

  //------------------------------------------------------------------------//
  //                                 Signal                                 //
  //------------------------------------------------------------------------//
  static makeSignalRelay(signals = {}) {
    const relay = new SignalRelay(signals);
    MKFramework._localSignalRelayList.set(relay, signals);
    return relay;
  }

  //------------------------------------------------------------------------//
  //                            User local store                           //
  //------------------------------------------------------------------------//
  async openUserStorage(userID, pluginID, storeID) {
    const store = new UserIndexDB(userID, pluginID);
    await store.open(storeID);
    MKFramework._userStorageList.push(store);
    return store;
  }

  //------------------------------------------------------------------------//
  //                                  User                                  //
  //------------------------------------------------------------------------//

  async userCreate(metavaultUUID, wsInstance = null) {
    return await User.create(metavaultUUID, wsInstance);
  }
  async userRegister(username, password) {
    return await User.register(username, password);
  }

  //------------------------------------------------------------------------//
  //                         Local master pipe relay                       //
  //------------------------------------------------------------------------//
  makeLocalMasterPipeRelay(signals = {}) {
    const relay = new MasterPipeRelay(signals);
    MKFramework._localSignalRelayList.set(relay, signals);
    return relay;
  }
  destroyLocalMasterPipeRelay(relay) {
    console.log("Not implemented yet: MKFramework.destroyLocalMasterPipeRelay");
  }

  //------------------------------------------------------------------------//
  //                            Context Switcher                           //
  //------------------------------------------------------------------------//
  switchContext(context) {
    console.log("Not implemented yet: MKFramework.switchContext");
  }
  registerContext(context) {
    console.log("Not implemented yet: MKFramework.registerContext");
  }
  unregisterContext(context) {
    console.log("Not implemented yet: MKFramework.unregisterContext");
  }
}
