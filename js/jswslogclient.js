// d:0198236f-ef06-73ff-a59f-d5f04c98dda7
class JSWSLogClient {
  // d:0198268e-2889-7ed4-8de3-b2a05f2d2d33
  constructor(url, token, name, onEvent) {
    this.onEvent = onEvent || ((msg) => console.log(msg));
    this.url = url;
    this.token = token;
    this.name = name;
    this.ws = null;
    this.connected = false;

    this._reconnectDelay = 2000; // 2 seconds
    this._reconnectTimer = null;

    this._connect();
  }

  _connect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }
    clearTimeout(this._reconnectTimer);

    //--

    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      this.connected = true;
      this.onEvent("JSWSLogClient ✅ Connected");

      this.ws.send(
        JSON.stringify({
          role: "sender",
          name: this.name,
          token: this.token,
        }),
      );
    });

    this.ws.addEventListener("close", () => {
      this.connected = false;
      this.onEvent("JSWSLogClient ❌ Disconnected");
      __masterPipeRelay.pipe._.set(__sig.NETWORK_CONNECTION);
      this._scheduleReconnect();
    });

    this.ws.addEventListener("error", (err) => {
      this.connected = false;
      this.onEvent("JSWSLogClient ⚠️ Connection error");
      __masterPipeRelay.pipe._.set(__sig.NETWORK_CONNECTION);
      this._scheduleReconnect();
    });

    this.ws.addEventListener("message", (event) => {
      const raw = event.data;

      // Handle raw ping string
      if (raw === "ping") {
        this.ws.send("pong");
        return;
      }

      try {
        const msg = JSON.parse(raw);

        if (
          msg.type === "status" &&
          msg.message.startsWith("Identified as sender")
        ) {
          this.connected = true;
          this.onEvent("✅ Confirmed by server");
          __masterPipeRelay.pipe._.set(__sig.NETWORK_CONNECTION);
        }

        if (msg.type !== "pong") {
          this.onEvent("JSWSLogClient ↩️ Message from server:", msg);
        }
      } catch {
        this.onEvent("JSWSLogClient ↩️ Raw message from server:", raw);
      }
    });

    // Optional keepalive
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send("ping");
      }
    }, 30000);
  }

  //  send(category, message, data = null) {
  //    if (!this.connected || this.ws.readyState !== WebSocket.OPEN) return;
  //
  //    const payload = { category, message };
  //    if (data !== null) payload.data = data;
  //
  //    this.ws.send(JSON.stringify(payload));
  //  }

  send(category, message, data = null) {
    if (!this.connected || this.ws.readyState !== WebSocket.OPEN) {
      console.log(
        "-------------fffffffffffffffffffff-----  JSWSLogClient: No connection to server, printing log here:",
        category,
        message,
      );
      this.onEvent(
        "JSWSLogClient. No connection to server, printing log here:",
        `Category: ${category}, Message: ${message}`,
      );
      return;
    }

    const payload = { category, message };
    if (data !== null) payload.data = data;

    this.ws.send(JSON.stringify(payload));
  }

  log(msg) {
    const lines = (new Error().stack || "").split("\n");

    const simplified = lines
      .map((l) =>
        l
          // Firefox style: func@https://host/path/file:line:col  → func@file:line:col
          .replace(/@https?:\/\/[^/]+\/([^:]+:\d+:\d+)/, "@$1")
          // Chrome style: at func (https://host/path/file:line:col) → at func (file:line:col)
          .replace(/\(https?:\/\/[^/]+\/([^:]+:\d+:\d+)\)/, "($1)"),
      )
      .join("\n");

    // four-slot category so server log shows no “?” placeholders
    this.send(["browser", "log()"], msg, simplified);
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) return; // already scheduled
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this.onEvent("JSWSLogClient 🔁 Attempting reconnect...");
      this._connect();
    }, this._reconnectDelay);
  }
}
