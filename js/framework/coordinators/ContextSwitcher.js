// d:019835dc-85e1-7aae-815f-62590b3ad4ec
export class ContextSwitcher {
  constructor() {
    this.currentContext = null;
    this.currentUserInteractionCoordinator = null;
    this.currentContextMasterPipeRelay = null;
  }

  switchTo(contextType) {
    let returnValue = null;
    console.log(`ContextSwitcher: switching to context type ${contextType}`);
    switch (contextType) {
      case Context.type.REGISTER_USER:
        returnValue = this._switchToRegisterUser();
        break;
      default:
        throw new Error(`Unknown context type: ${contextType}`);
    }
    __masterPipeRelay.pipe._.set(__sig.SWITCH_CONTEXT);
    console.log(`________________signal ${__sig.SWITCH_CONTEXT} sent`);
    return returnValue;
  }
  _switchToRegisterUser() {
    //TODO: Destroy previous context if it exists
    // destroy previous user interaction coordinator if it exists, and PipeRelay
    //if (this.currentUserInteractionCoordinator) {
    //  this.currentUserInteractionCoordinator.pipe.destroy();
    //  this.currentUserInteractionCoordinator = null;
    //}

    // Pipe relay system local to the context (to not interfere with global context and other contexts)
    console.log("----------------____________---------------");
    const Signals = Object.freeze({
      USER_REGISTER_SUBMISSION: 0,
      USER_REGISTER_RESULT: 1,
    });
    //TODO: Remove name from MasterPipeRelay, it is not used
    this.currentContextMasterPipeRelay = new MasterPipeRelay(
      "register-user-master-pipe",
      Signals,
    );
    console.log(
      `))))))))))ContextSwitcher: Created new MasterPipeRelay for context type ${Context.type.REGISTER_USER} with ID ${this.currentContextMasterPipeRelay.id}`,
    );
    console.log(this.currentContextMasterPipeRelay);
    // Create new user action coordinator to rout signals from UI components to unteractoin coordinators
    this.currentUserInteractionCoordinator = new UserInteractionCoordinator(
      this.currentContextMasterPipeRelay,
    );

    this.currentContext = new Context(Context.type.REGISTER_USER, {
      components: [
        {
          name: "register user",
          el: new RegisterUserUI(this.currentContextMasterPipeRelay).render(),
        },
        {
          name: "console display",
          el: new ConsoleDisplay().render(),
        },
        {
          name: "JS WS log client status display",
          el: new JSWSLogClientStatusDisplay().render(),
        },
      ],
    });
  }
}
