// d:019837c5-6b63-7af8-bbd5-1390a8cfa768
export class encryption {
  constructor() {}
  //password key derivation (PBKDF2)
  //asymmetric keypair generation (ECDSA)
  //symmetric key material prep (AES-GCM)
  static async secureKeyBundleInitializer(password) {
    // Derive key from password
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
      ),
      256,
    );
    const derivedKeyBytes = new Uint8Array(derivedBits);
    const derivedKeyHex = Array.from(derivedKeyBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const cachedKeyB64 = btoa(String.fromCharCode(...derivedKeyBytes));
    const derivedKey = await crypto.subtle.importKey(
      "raw",
      derivedKeyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    // Generate ECDSA keypair
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"],
    );
    const publicKeyJwk = await crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey,
    );
    const privateKeyRaw = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );
    const privateKeyB64 = btoa(
      String.fromCharCode(...new Uint8Array(privateKeyRaw)),
    );

    const saltB64 = btoa(String.fromCharCode(...salt));
    return {
      privateKeyB64,
      publicKeyJwk,
      passwordDerivedKeyHex: derivedKeyHex,
      saltB64,
      cachedKeyB64,
      derivedKey,
    };
  }
}
