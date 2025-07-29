// d:01983726-0190-7681-97f4-674b375d50f3
class User {
  static currentRegistrationAttemptSucceeded = false;

  constructor(metavaultUUID, wsInstance = null) {
    this.metavaultUUID = metavaultUUID;
    this.ws = wsInstance; // May be null, in which case we will create it later
    console.log("User constructor called with metavaultUUID:", metavaultUUID);
    this.userLocalStore = new UserLocalStore();
  }
  //Async can not be inside constructor, so make separate create method
  static async create(metavaultUUID, wsInstance = null) {
    if (!metavaultUUID) throw new Error("create() requires a metavaultUUID");
    const user = new User(metavaultUUID, wsInstance);
    await user.userLocalStore.open(metavaultUUID);
    await user.userLocalStore.load();
    return user;
  }

  static uuidv7() {
    const now = BigInt(Date.now()).toString(16).padStart(12, "0");
    const rand = crypto.getRandomValues(new Uint8Array(10));
    const timeLow = now.slice(0, 8);
    const timeMid = now.slice(8, 12);
    const timeHi =
      ((rand[0] & 0x0f) | 0x70).toString(16).padStart(2, "0") +
      rand[1].toString(16).padStart(2, "0");
    const clockSeq =
      ((rand[2] & 0x3f) | 0x80).toString(16).padStart(2, "0") +
      rand[3].toString(16).padStart(2, "0");
    const node = [...rand.slice(4)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
  }

  static nonOwnedWs = null;

  static async _ensureSocket() {
    // Use User.ws instead of this.ws
    if (
      !User.nonOwnedWs ||
      User.nonOwnedWs.socket.readyState >= WebSocket.CLOSING
    ) {
      User.nonOwnedWs = new WSPluginClient();
      await User.nonOwnedWs.ready;
      User.nonOwnedWs.onMessage = (data) =>
        console.log("WebAuth WS message:", data);
    }
  }

  // Returns metavaultUUID of the newly created user, or false on error
  static async register(username, password) {
    await User._ensureSocket();
    username = username.trim();

    if (!username || !password) {
      alert("Username and password required");
      return;
    }

    const metavaultUUID = User.uuidv7();
    const permanonceUUID = User.uuidv7();

    // ENC
    // Save locally
    const keyBundle = await encryption.secureKeyBundleInitializer(password);

    const userData = {
      username,
      metavaultUUID,
      permanonceUUID,
      keyBundle,
      isEnabled: true,
    };

    // Send registration to server
    const encoder = new TextEncoder();
    const payload = encoder.encode(
      JSON.stringify({
        username,
        metavault_uuid: metavaultUUID,
        permanonce_uuid: permanonceUUID,
        permanonce_pubkey: keyBundle.publicKeyJwk,
      }),
    );

    try {
      const result = await User.nonOwnedWs.send(0, 0, payload);
      const errorCode = result.errorCode;
      const decoded = new TextDecoder().decode(result.payload);
      if (errorCode === 0) {
        User.currentRegistrationAttemptSucceeded = true;
        console.log("🛠 Creating user object");
        let newUser = await User.create(metavaultUUID, User.nonOwnedWs);
        console.log("✅ Created user");
        User.nonOwnedWs = null; // Clear the non-owned socket after use
        console.log("💾 Writing to userLocalStore");
        newUser.userLocalStore.data = userData;
        await newUser.userLocalStore.save();
        console.log("✅ Saved userLocalStore");
        // No emitting signals here, this is just core logic that does one thing. It does not care about surrounding context. The caller does whatever based on return, such as sending signals...
        //TODO: progress with metavault creation below then return
        return metavaultUUID;
      } else {
        return false;
      }
      //	User.currentRegistrationAttemptSucceeded = true;
      //	console.log("User registration successful:", userData);
      //	// Save user data to local store
      //	await this.userDataStore.save(userData);
      //      } else {
      //				//error
      //      }
    } catch (err) {
      console.error("Server error:", err.message);
    }

    //    // Encrypt and send MetaVault
    //    const mv = {
    //      user_uuid: User.uuidv7(),
    //      metavault_uuid,
    //      permanonce_uuid,
    //      private_key_b64: privateKeyB64,
    //      public_key_jwk: publicKeyJwk,
    //      password_derived_key_hex: derivedKeyHex,
    //      salt_b64: btoa(String.fromCharCode(...salt)),
    //    };
    //
    //    const iv = crypto.getRandomValues(new Uint8Array(12));
    //    const mvJson = JSON.stringify(mv);
    //    const encrypted = await crypto.subtle.encrypt(
    //      { name: "AES-GCM", iv },
    //      derivedKey,
    //      enc.encode(mvJson),
    //    );
    //    const ctBytes = new Uint8Array(encrypted);
    //    const payload = new Uint8Array(salt.length + iv.length + ctBytes.length);
    //    payload.set(salt, 0);
    //    payload.set(iv, salt.length);
    //    payload.set(ctBytes, salt.length + iv.length);
    //
    //    this.ws.sendMetavaultOperation("a", metavault_uuid, payload);
  }

  uuidv7() {
    const now = BigInt(Date.now()).toString(16).padStart(12, "0");
    const rand = crypto.getRandomValues(new Uint8Array(10));
    const timeLow = now.slice(0, 8);
    const timeMid = now.slice(8, 12);
    const timeHi =
      ((rand[0] & 0x0f) | 0x70).toString(16).padStart(2, "0") +
      rand[1].toString(16).padStart(2, "0");
    const clockSeq =
      ((rand[2] & 0x3f) | 0x80).toString(16).padStart(2, "0") +
      rand[3].toString(16).padStart(2, "0");
    const node = [...rand.slice(4)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
  }

  async verify(wsInstance) {
    const { permanonce_uuid, private_key_b64 } =
      this.userDataStore.data.encryption;
    if (!permanonce_uuid || !private_key_b64) {
      throw new Error("Missing user keys");
    }

    const bin = atob(private_key_b64);
    const privKey = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(bin, (c) => c.charCodeAt(0)),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"],
    );

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privKey,
      challenge,
    );

    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    wsInstance.send(
      0,
      JSON.stringify({
        action: "verify",
        permanonce_uuid,
        challenge: Array.from(challenge),
        signature: sig,
      }),
    );

    return true; // No roundtrip verification from server, we assume local sign was valid.
  }

  async init() {
    await this.ws.ready;

    try {
      await this.verify(); // 🔐 attempt verify
      this.status = "connected";
    } catch (e) {
      const msg = `❌ Verification failed for user ${this.id}: ${e.message || e}`;
      console.warn(msg);

      // 🔊 Dispatch as ws-message so it shows in ConsoleDisplay
      //window.dispatchEvent(new CustomEvent("ws-message", { detail: msg }));

      this.status = "unauthorized";
      this.enabled = false;
      this.data.is_enabled = false;
      this.ws.close();
      await this.userDataStore.save(this.data); // persist disabled
    }

    window.dispatchEvent(new Event("user-updated"));
  }

  async enable() {
    this.enabled = true;
    this.userDataStore.data.is_enabled = true;

    // ✅ ensure socket exists
    if (!this.ws || this.ws.socket.readyState !== WebSocket.OPEN) {
      this.ws = new WSPluginClient();
    }

    // ✅ verify via user’s own socket
    try {
      await this.verify(this.ws);
    } catch (e) {
      console.error("User verification failed:", e);
    }

    //window.dispatchEvent(new Event("user-updated"));
  }

  async disable() {
    this.enabled = false;
    this.userDataStore.data.is_enabled = false;
    if (this.ws?.socket.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    //window.dispatchEvent(new Event("user-updated"));
  }

  send(pluginKey, payload) {
    this.ws.sendBinary(pluginKey, payload);
  }

  //  async verify() {
  //    const { permanonce_uuid, private_key_b64 } =
  //      this.userDataStore.data.encryption;
  //    if (!permanonce_uuid || !private_key_b64) {
  //      throw new Error("Missing user keys");
  //    }
  //
  //    const bin = atob(private_key_b64);
  //    const privKey = await crypto.subtle.importKey(
  //      "pkcs8",
  //      Uint8Array.from(bin, (c) => c.charCodeAt(0)),
  //      { name: "ECDSA", namedCurve: "P-256" },
  //      false,
  //      ["sign"],
  //    );
  //
  //    const challenge = crypto.getRandomValues(new Uint8Array(32));
  //    const signature = await crypto.subtle.sign(
  //      { name: "ECDSA", hash: "SHA-256" },
  //      privKey,
  //      challenge,
  //    );
  //
  //    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
  //      .replace(/\+/g, "-")
  //      .replace(/\//g, "_")
  //      .replace(/=+$/, "");
  //
  //    this.ws.send(
  //      0,
  //      JSON.stringify({
  //        action: "verify",
  //        permanonce_uuid,
  //        challenge: Array.from(challenge),
  //        signature: sig,
  //      }),
  //    );
  //
  //    return true; // No roundtrip verification from server, we assume local sign was valid.
  //  }
}
