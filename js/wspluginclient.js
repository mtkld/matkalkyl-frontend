class WSPluginClient {
  constructor(url = "wss://test.matkalkyl.dev/ws") {
    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer";
    this.ready = new Promise((resolve) => {
      this.socket.addEventListener("open", () => resolve(true));
    });

    this.pendingRequests = new Map();

    this.socket.addEventListener("message", (e) => {
      if (!(e.data instanceof ArrayBuffer)) return;

      const view = new DataView(e.data);
      const ticket = view.getUint16(0); // ticket: first 2 bytes
      const errorCode = view.getUint8(2); // plugin key: next 1 bytes
      const payload = new Uint8Array(e.data, 3); // rest: payload

      const resolver = this.pendingRequests.get(ticket);
      if (resolver) {
        this.pendingRequests.delete(ticket);
        resolver.resolve({ errorCode, payload }); // resolve with raw payload
      } else {
        console.warn(`No pending request found for ticket ${ticket}`);
      }
    });

    this.usedTickets = new Set(); // simple in-memory tracking of active tickets
  }

  _generateUniqueTicket() {
    let ticket;
    do {
      ticket = Math.floor(Math.random() * 65536); // 16-bit number
    } while (this.usedTickets.has(ticket));
    this.usedTickets.add(ticket);
    return ticket;
  }

  async send(pluginId, pluginAction, binaryPayload) {
    await this.ready;

    if (!(binaryPayload instanceof Uint8Array)) {
      throw new Error("Payload must be a Buffer");
    }

    const ticket = this._generateUniqueTicket();

    const buffer = new ArrayBuffer(6 + binaryPayload.length);
    const view = new DataView(buffer);
    view.setUint16(0, ticket); // Ticket ID
    view.setUint16(2, pluginId);
    view.setUint16(4, pluginAction);
    new Uint8Array(buffer, 6).set(binaryPayload);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(ticket);
        this.usedTickets.delete(ticket);
        reject(new Error("Timeout waiting for response"));
      }, 10000); // 10 sec timeout

      this.pendingRequests.set(ticket, {
        resolve: (data) => {
          clearTimeout(timeout);
          this.usedTickets.delete(ticket);
          resolve(data);
        },
        reject,
      });

      this.socket.send(new Uint8Array(buffer));
    });
  }

  close() {
    this.socket?.close();
  }
}

//  sendMetavaultOperation(operation, uuid, data) {
//    if (operation.length !== 1) {
//      throw new Error("Operation must be a single character");
//    }
//    if (typeof uuid !== "string" || uuid.length !== 36) {
//      throw new Error("UUID must be a 36-character string");
//    }
//    if (!(data instanceof Uint8Array)) {
//      throw new Error("Data must be a Uint8Array");
//    }
//
//    const uuidBytes = new TextEncoder().encode(uuid); // 36 bytes
//    const message = new Uint8Array(1 + uuidBytes.length + data.length);
//    let offset = 0;
//    message[offset++] = operation.charCodeAt(0);
//    message.set(uuidBytes, offset);
//    offset += uuidBytes.length;
//    message.set(data, offset);
//
//    this.sendBinary(1, message); // plugin 1 = metavault
//  }
