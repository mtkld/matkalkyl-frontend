class JSWSLogClientStatusDisplay {
  constructor() {
    this.pipe = new Pipe();
    this._listenerId = `JSWSLogClientStatusDisplay-${crypto.randomUUID().slice(0, 8)}`;
    this.el = this._createStatusElement();

    __masterPipeRelay.registerReceiver(this.pipe._);
    this._startLoopReceivingPipe();
    this.updateStatus(); // Initial render
  }

  _createStatusElement() {
    const el = document.createElement("div");
    el.id = "ws-log-status";
    el.className = "ws-status";
    el.textContent = "WebSocket status: unknown";
    document.body.appendChild(el); // You can append elsewhere if needed
    return el;
  }

  render() {
    return this.el;
  }

  updateStatus() {
    if (window.logger?.connected) {
      this.el.textContent = "JSWS Logger WebSocket status: connected";
      this.el.classList.remove("status-false");
      this.el.classList.add("status-true");
    } else {
      this.el.textContent = "JSWS Logger WebSocket status: disconnected";
      this.el.classList.remove("status-true");
      this.el.classList.add("status-false");
    }
  }

  _startLoopReceivingPipe() {
    (async () => {
      while (true) {
        const msg = await this.pipe._.get(this._listenerId);
        l("JSWSLogcliClientStatusDisplay received pipe signal: " + msg);
        if (msg === __sig.NETWORK_CONNECTION) {
          this.updateStatus();
        }
      }
    })();
  }
}
