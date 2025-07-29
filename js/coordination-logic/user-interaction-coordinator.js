// d:01983770-ee2f-7354-822a-12e67580ad76
class UserInteractionCoordinator {
  constructor(masterPipeRelay) {
    this.masterPipeRelay = masterPipeRelay;
    this.pipe = new Pipe();
    this._listenerId = `UIC-${crypto.randomUUID().slice(0, 8)}`;
    this.masterPipeRelay.registerReceiver(this.pipe._);

    this._startLoopReceivingPipe();
  }
  _startLoopReceivingPipe() {
    (async () => {
      while (true) {
        const sig = await this.pipe._.get(this._listenerId);
        console.log(
          `UserInteractionCoordinator received signal: ${sig} with ID: ${this._listenerId}`,
        );
        console.log(
          `MasterPipeRelay signals: ${JSON.stringify(this.masterPipeRelay.sig)}`,
        );

        if (sig === this.masterPipeRelay.sig.USER_REGISTER_SUBMISSION) {
          console.log("RUNNING SU BMISS IION");
          let newUserMetavaultUUID = await User.register(
            __uiDataCoordinator.get("RegisterUserUI-username"),
            __uiDataCoordinator.get("RegisterUserUI-password"),
          );
          console.log(
            "------_________xxx_______--------RECIEVED: newUserMetavaultUUID",
            newUserMetavaultUUID,
          );
          if (newUserMetavaultUUID) {
            console.log("User registration successful:", newUserMetavaultUUID);
            __uiDataCoordinator.set(
              "newUserMetavaultUUID",
              newUserMetavaultUUID,
            );
            this.masterPipeRelay.pipe._.set(
              this.masterPipeRelay.sig.USER_REGISTER_RESULT,
            );
          } else {
            console.error("User registration failed.");
            this.masterPipeRelay.pipe._.set(
              this.masterPipeRelay.sig.USER_REGISTER_RESULT,
            );
          }
        }
        if (sig === this.masterPipeRelay.sig.USER_REGISTER_RESULT) {
          console.log("User registration result received.");
        }
      }
    })();
  }
}
