// Unused, remove
//window.pipe = new Pipe();

// All conceptual states of the site made to constants, used by all modules in signaling
const Signals = Object.freeze({
  USER_REGISTERED: 0,
  NETWORK_IN: 1,

  NETWORK_CONNECTION: 2,
  SWITCH_CONTEXT: 3,
});

window.__masterPipeRelay = new MasterPipeRelay("pipe-master", Signals);
window.__sig = Signals;

var logger = new JSWSLogClient(
  "wss://matkalkyl.dev/ws",
  "your-secret-token",
  "JS-WebClient",
);

window.__uiDataCoordinator = new UIDataCoordinator();

window.__logger = logger;
window.l = logger.log.bind(logger);

//  Set up initial context for the application
//
//
