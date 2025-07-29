// d:019826a3-2c50-75a8-b94a-eeaf62fffd73
class MasterPipeRelay {
  // d:019826a3-4cff-7498-8af8-bd46fc5f6182
  constructor(name = "master", signals = {}) {
    this._signals = new Set(Object.values(signals));
    this._signalsOriginalObject = signals; // keep original object for reference
    this.sig = signals; // keep one for public access
    this.id = `${name}-${crypto.randomUUID().slice(0, 8)}`; // unique listener ID
    this.pipe = new Pipe(); // public and exposed
    this._receivers = new Set(); // just Pipe instances

    this._startDispatchLoop();
  }

  // d:019826a3-d4d4-782c-a4ae-1b2794757c6a
  registerReceiver(pipe) {
    this._receivers.add(pipe);
  }

  _startDispatchLoop() {
    console.log(`[${this.id}] Starting dispatch loop...`);
    (async () => {
      while (true) {
        const signal = await this.pipe._.get(this.id);
        l(`-------- [${this.id}] Received signal:` + signal);
        if (signal === null || signal === undefined) {
          console.warn(`[${this.id}] ❌ Received null or undefined signal`);
          continue;
        }
        if (!this._signals.has(signal)) {
          console.warn(
            `[${this.id}] ❌ Rejected unregistered signal "${signal}"`,
          );
          continue;
        }

        for (const receiverPipe of this._receivers) {
          try {
            receiverPipe.set(signal); // receiver must filter on its end
          } catch (err) {
            console.warn(`[${this.id}] Failed to dispatch signal:`, err);
          }
        }
      }
    })();
  }
  getSignalTypeName(code) {
    for (const [name, value] of Object.entries(this._signalsOriginalObject)) {
      if (value === code) return name;
    }
    return "UNKNOWN_SIGNAL";
  }
}

// Deleted
// x:019826a3-ce8b-7790-9eb5-b14a2c06ced4
