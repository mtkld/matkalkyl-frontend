// Included by PHP
const log = (msg) => {
  const el = document.createElement("pre");
  el.textContent = typeof msg === "string" ? msg : JSON.stringify(msg, null, 2);
  document.body.appendChild(el);
};

try {
  // Create a UserIndexDB instance
  const userID = "user123";
  const pluginID = "pluginABC";
  const storeName = "testStore";

  const userDB = new UserIndexDB(userID, pluginID);
  const store = await userDB.getStore(storeName);

  // Save test data
  const testData = {
    id: "sample1",
    message: "Hello from IndexedDB!",
    timestamp: new Date().toISOString(),
  };

  store.data = testData;
  await store.save();
  log("✅ Data saved.");

  // Load it back
  const result = await store.load("sample1");
  log("📦 Loaded data:");
  log(result);

  // List stores
  const stores = await userDB.listStores();
  log("📂 Stores in DB:");
  log(stores);

  // Optional: close
  store.closeDatabase();
  log("🛑 Database closed.");
} catch (err) {
  log(`❌ Error: ${err?.message || err}`);
  console.error(err); // optional full stack trace to console
}
//  // Get our console UI up first so it can capture any early messages
//  // ✅ Create and mount ConsoleDisplay
//  const consoleDisplay = new ConsoleDisplay("#live-console", 100, false);
//  root?.appendChild(consoleDisplay.render());
//  window.consoleDisplay = consoleDisplay;
//
//  // Render auth form + user list
//  const store = new UserStore();
//  const userList = new UserAccountList(store);
//  await userList.loadUsers();
//  const auth = new WebAuth(store, userList);
//
//  root?.appendChild(auth.renderForm());
//  const container = document.createElement("div");
//  container.id = "userInfo";
//  root?.appendChild(container);
//  auth.refreshListUI(); // renders the list
// ------------ EVENT HANDLERS -----------------
//  // Re-render when a user is enabled / disabled
//  window.addEventListener("user-updated", () => {
//    auth.refreshListUI();
//  });
//
//  // ✅ Create and mount JSWSLogClientStatusDisplay
//  const loggerStatus = new JSWSLogClientStatusDisplay();
//  root?.appendChild(loggerStatus.el); // Mount the status element
//  window.loggerStatus = loggerStatus;
//
//------------------------------------------------------------------------//
//                            previous old code                          //
//------------------------------------------------------------------------//
// Show all users in IndexedDB
//////////////////// PREVIOUS OLD CODE
//  const root = document.querySelector("#mount-root");
//  window.__displayCoordinator = new DisplayCoordinator(root);
//
//  window.__contextSwitcher = new ContextSwitcher();
//  __contextSwitcher.switchTo(Context.type.REGISTER_USER);
//  const dbRequest = indexedDB.open("MKLocalDB");
//
//  dbRequest.onsuccess = () => {
//    const db = dbRequest.result;
//    const tx = db.transaction("users", "readonly");
//    const store = tx.objectStore("users");
//    const allRequest = store.getAll();
//
//    allRequest.onsuccess = () => {
//      const users = allRequest.result;
//      const section = document.createElement("section");
//      section.style.marginTop = "2em";
//      section.innerHTML = `<h2>📂 Saved Users</h2><pre>${JSON.stringify(users, null, 2)}</pre>`;
//      document.querySelector("#mount-root")?.appendChild(section);
//    };
//
//    allRequest.onerror = () => {
//      console.error("❌ Failed to read users:", allRequest.error);
//    };
//  };
//
//  dbRequest.onerror = () => {
//    console.error("❌ Could not open IndexedDB:", dbRequest.error);
//  };
