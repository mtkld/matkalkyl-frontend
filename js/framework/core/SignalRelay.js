// d:019869aa-a086-7a2c-bdd8-3144a1391cb2
export class SignalRelay {
  constructor(signals = {}) {
    this.signals = signals;
    this.masterPipeRelay = new MasterPipeRelay(signals);
  }

  send(signal) {
    this.masterPipeRelay.pipe._.set(signal);
  }
  registerListener(pipe) {
    this.masterPipeRelay.registerReceiver(pipe);
  }
  listSignals() {
    return this.signals;
  }
}
