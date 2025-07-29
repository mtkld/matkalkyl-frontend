class ConsoleDisplay {
  constructor(selector = "#console", maxLines = 100, ascending = true) {
    this.selector = selector;
    this.maxLines = maxLines;
    this.ascending = ascending;
    this.lines = [];

    this.pipe = new Pipe();
    this._listenerId = `ConsoleDisplay-${crypto.randomUUID().slice(0, 8)}`;
    __masterPipeRelay.registerReceiver(this.pipe._);

    // Create or reference the console element
    this.consoleElement = document.querySelector(selector);
    if (!this.consoleElement) {
      this.consoleElement = this._createConsoleElement();
      document.body.appendChild(this.consoleElement);
      console.warn(`⚠️ Console element not found, created one at: ${selector}`);
    }
    this._startLoopReceivingPipe();
  }
  _startLoopReceivingPipe() {
    (async () => {
      while (true) {
        const msg = await this.pipe._.get(this._listenerId);
        let text = `${__masterPipeRelay.getSignalTypeName(msg)}: `;
        if (msg === __sig.SWITCH_CONTEXT) {
          this.log(
            text +
              "" +
              Context.getTypeName(__contextSwitcher.currentContextType),
          );
        } else if (msg === __sig.NETWORK_CONNECTION) {
          if (__logger && __logger.connected) {
            text += "Diagnostics Connected";
          } else {
            text += "Diagnostics Disconnected";
          }
          this.log(text);
        } else {
          this.log(`Received signal without description: ${msg}`);
        }
      }
    })();
  }
  log(msg) {
    const time = new Date().toLocaleTimeString("sv-SE", { hour12: false });
    const line = `[${time}] ${msg}`;
    this.lines.push(line);
    if (this.lines.length > this.maxLines) this.lines.shift();

    const linesToRender = this.ascending
      ? this.lines
      : [...this.lines].reverse();

    this.consoleElement.innerHTML = linesToRender
      .map(this._escapeHtml)
      .join("<br>");
  }

  clear() {
    this.lines = [];
    if (this.consoleElement) this.consoleElement.innerHTML = "";
  }

  _escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  _createConsoleElement() {
    const div = document.createElement("div");
    div.id = this.selector.startsWith("#")
      ? this.selector.slice(1)
      : this.selector;
    div.style.background = "#222";
    div.style.color = "#0f0";
    div.style.padding = "1em";
    div.style.fontFamily = "monospace";
    div.style.fontSize = "14px";
    div.style.whiteSpace = "pre-wrap";
    div.style.border = "1px solid #444";
    div.style.margin = "1em 0";
    return div;
  }

  render() {
    return this.consoleElement;
  }
}
