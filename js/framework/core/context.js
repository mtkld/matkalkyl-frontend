// d:019835db-7d60-722d-938b-637e89c7ca81
class Context {
  static type = Object.freeze({
    REGISTER_USER: 0,
  });

  constructor(config = {}) {
    this.config = { ...config }; // shallow clone of config object
    this.components = [];

    if (Array.isArray(config.components)) {
      for (const c of config.components) {
        if (typeof c?.name === "string" && c?.el instanceof HTMLElement) {
          // Shallow clone each entry
          this.components.push({ ...c });
        } else {
          console.warn(
            "Invalid component config: 'el' must be an HTMLElement",
            c,
          );
        }
      }
    }
  }

  get list() {
    return [...this.components]; // shallow clone of array
  }

  static getTypeName(typeCode) {
    for (const [name, code] of Object.entries(Context.type)) {
      if (code === typeCode) return name;
    }
    return "UNKNOWN";
  }
}
