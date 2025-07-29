// d:0198364d-7805-77b4-abcd-9cb7803e5276
class DisplayCoordinator {
  constructor(rootEl) {
    this.rootEl = rootEl;
    this._listenerId = `ConsoleDisplay-${crypto.randomUUID().slice(0, 8)}`;
    this.pipe = new Pipe();
    __masterPipeRelay.registerReceiver(this.pipe._);
    this._startLoopReceivingPipe();
  }

  _startLoopReceivingPipe() {
    (async () => {
      while (true) {
        const sig = await this.pipe._.get(this._listenerId);
        console.log(
          "DisplayCoordinator received message:" +
            sig +
            " and context type: " +
            __sig.SWITCH_CONTEXT,
        );
        if (sig == window.__sig.SWITCH_CONTEXT) {
          this._renderFromContext(__contextSwitcher.currentContext);
        }
      }
    })();
  }

  _renderFromContext(context) {
    if (
      !context ||
      (typeof context.list !== "function" && !Array.isArray(context.list))
    ) {
      console.warn("No valid context to render from");
      return;
    }

    // Clear previous UI
    this.rootEl.innerHTML = "";

    for (const { el } of context.list) {
      if (el instanceof HTMLElement) {
        this.rootEl.appendChild(el);
      } else {
        console.warn("Invalid element in context component:", el);
      }
    }
  }
}
