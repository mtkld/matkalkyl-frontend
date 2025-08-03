// d:019835f9-f91e-7438-88f2-d059b7c28606
class RegisterUserUI {
  constructor(contextMasterPipeReplay, config = {}) {
    this.contextMasterPipeReplay = contextMasterPipeReplay;
    this.config = config;
    this.prefix = "RegisterUserUI-";
    this._onClick = null; // store handler to remove later
    this.wrapper = null; // store DOM for removal
  }
  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.innerHTML = `
      <h3>Register New User</h3>
      <label>Username: <input id="${this.prefix}username" /></label><br>
      <label>Password: <input type="password" id="${this.prefix}password" /></label><br>
      <button id="${this.prefix}btn">Register</button>
    `;

    this._onClick = () => {
      __uiDataCoordinator.set(
        this.prefix + "username",
        this.wrapper.querySelector(`#${this.prefix}username`).value.trim(),
      );
      __uiDataCoordinator.set(
        this.prefix + "password",
        this.wrapper.querySelector(`#${this.prefix}password`).value.trim(),
      );
      this.contextMasterPipeReplay.pipe._.set(
        this.contextMasterPipeReplay.sig.USER_REGISTER_SUBMISSION,
      );
    };

    this.wrapper
      .querySelector(`#${this.prefix}btn`)
      .addEventListener("click", this._onClick);

    return this.wrapper;
  }

  destroy() {
    if (this.wrapper) {
      const btn = this.wrapper.querySelector(`#${this.prefix}btn`);
      if (btn && this._onClick) {
        btn.removeEventListener("click", this._onClick);
      }
      this.wrapper.remove(); // optional: remove from DOM
    }

    this.wrapper = null;
    this._onClick = null;
    this.contextMasterPipeReplay = null;
    this.config = null;
  }
}
