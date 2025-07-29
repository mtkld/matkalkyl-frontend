class UserAccountList {
  constructor(store) {
    this.store = store; // instance of UserStore
    this.users = {}; // Map of id → User
  }

  async loadUsers() {
    const all = await this.store.getAllUsers();
    for (const data of all) {
      const user = new User(data, this.store);
      if (user.enabled) {
        await user.init(); // ⬅️ only open WebSocket if enabled
      }
      this.users[data.id] = user;
    }
  }

  addUser(user) {
    this.users[user.id] = user;
  }

  getUser(id) {
    return this.users[id] || null;
  }

  removeUser(id) {
    if (this.users[id]) {
      this.users[id].ws?.close();
      delete this.users[id];
    }
  }

  getAll() {
    return Object.values(this.users);
  }

  renderList() {
    const container = document.createElement("div");

    if (Object.keys(this.users).length === 0) {
      container.textContent = "⚠️ No enabled users found.";
      return container;
    }

    for (const user of Object.values(this.users)) {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "0.5em";

      const label = document.createElement("div");
      label.style.fontWeight = "bold";
      label.style.cursor = "pointer";
      label.style.color = user.enabled ? "#0f0" : "#aaa";
      label.textContent =
        `👤 ${user.id}` +
        (user.enabled ? " [enabled]" : "") +
        (user.status === "connected" ? " 🟢 connected" : " ⚫ disconnected");

      // --- NEW TOGGLE BUTTON -----------------------------------
      const btn = document.createElement("button");
      btn.textContent = user.enabled ? "Disable" : "Enable";
      btn.style.marginLeft = "0.5rem";
      btn.addEventListener("click", async () => {
        btn.disabled = true; // UX: prevent double-clicks
        if (user.enabled) {
          await user.disable();
        } else {
          await user.enable();
        }
        btn.disabled = false;
      });
      // ---------------------------------------------------------

      const pre = document.createElement("pre");
      pre.style.display = "none";
      pre.textContent = JSON.stringify(user.data, null, 2);

      label.addEventListener("click", () => {
        pre.style.display = pre.style.display === "none" ? "block" : "none";
      });

      wrapper.appendChild(label);
      wrapper.appendChild(btn);
      wrapper.appendChild(pre);
      container.appendChild(wrapper);
    }

    return container;
  }
}

window.UserAccountList = UserAccountList;
