const sodium = require("libsodium-wrappers");
const crypto = require("crypto");
const hkdf = require("futoin-hkdf");

(async () => {
  // Wait for sodium to be ready
  await sodium.ready;

  // Generate X25519 key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync("x25519");
  const privateKeyBuffer = privateKey.export({ type: "pkcs8", format: "der" });

  // Server's public key (replace with the actual key)
  const serverPublicKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiaGFyYXRueHQiLCJleHAiOjE2OTg0MDEyNTB9.clkeCS7MlGjjfaqIhYymPsPo_GM1FID0M7yZ6buBpeA";

  const serverPublicKeyBuffer = Buffer.from(serverPublicKey, "hex");

  // Derive shared secret key using HKDF
  const sharedSecretKey = hkdf(
    Buffer.from(privateKeyBuffer),
    32,
    Buffer.from(serverPublicKeyBuffer, "base64"),
    32
  );
  console.log("Derived Shared Secret Key:", sharedSecretKey.toString("hex"));

  // Generate a random nonce
  const nonce = crypto.randomBytes(32);
  console.log("Nonce:", nonce);

  const clientNonce = nonce.toString("hex");
  console.log("Client Nonce (Hex):", clientNonce);

  // XOR nonce
  const serverNonce = "FkTELyYtb/O/PK7dGh7fV1BVPi4+mdcCudb5jnOYD5o=";
  const xoredNonce = xorStrings(serverNonce, clientNonce);
  console.log("XORed Nonce:", xoredNonce);

  function xorStrings(str1, str2) {
    const length = Math.min(str1.length, str2.length);
    const result = new Array(length);

    for (let i = 0; i < length; i++) {
      result[i] = String.fromCharCode(str1.charCodeAt(i) ^ str2.charCodeAt(i));
    }

    return result.join("");
  }

  // SMS Data JSON
  const smsData = {
    Message:
      "Dear Gautam Manuel, your credit card application Team IDFC FIRST Bank",
    MessageSource: "VMIFCFB",
  };

  const encodedSmsData = new TextEncoder().encode(JSON.stringify(smsData));
  console.log("Encoded SMS Data:", encodedSmsData);

  // Create a CryptoKey from the shared secret key
  const cryptoSharedSecretKey = await crypto.subtle.importKey(
    "raw",
    sharedSecretKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );

  const encodedNonce = new TextEncoder().encode(xoredNonce);

  // Encrypt data with AES-GCM
  const cipherText = await encryptData(
    encodedSmsData,
    cryptoSharedSecretKey,
    encodedNonce
  );

  async function encryptData(data, encryptionKey, nonce) {
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
      },
      encryptionKey,
      data
    );
    return new Uint8Array(ciphertext);
  }

  console.log("CipherText (Encrypted Data):", cipherText);

  // Decrypt AES-GCM
  const decryptedData = await decryptData(
    cipherText,
    cryptoSharedSecretKey,
    encodedNonce
  );

  async function decryptData(ciphertext, encryptionKey, nonce) {
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
      },
      encryptionKey,
      ciphertext
    );
    return new Uint8Array(plaintext);
  }

  console.log("Decrypted Data:", new TextDecoder().decode(decryptedData));
})();
