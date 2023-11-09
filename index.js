const crypto = require("crypto");

// Generate key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync("x25519");
const publicKeyDer = publicKey.export({ type: "spki", format: "der" });
const hexPublicKey = Buffer.from(publicKeyDer).toString("hex");

// Server public key (hex format)
const serverPublicKeyHex =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiaGFyYXRueHQiLCJleHAiOjE2OTg0MDEyNTB9.clkeCS7MlGjjfaqIhYymPsPo_GM1FID0M7yZ6buBpeA";
const serverPublicKeyBuffer = Buffer.from(serverPublicKeyHex, "hex");

// Derive session key
const privateKeyBuffer = privateKey.export({ type: "pkcs8", format: "der" });
const sessionKey = crypto.createSecretKey(
  crypto
    .createHmac("sha256", privateKeyBuffer)
    .update(serverPublicKeyBuffer)
    .digest()
);

// Generate nonce and XOR with server nonce
const nonce = crypto.randomBytes(32);
const serverNonceHex = "FkTELyYtb/O/PK7dGh7fV1BVPi4+mdcCudb5jnOYD5o=";
const serverNonce = Buffer.from(serverNonceHex, "base64");
const xorResult = Buffer.alloc(32);
for (let i = 0; i < 32; i++) {
  xorResult[i] = nonce[i] ^ serverNonce[i];
}
const xorResulthex = xorResult.toString("hex");

// Sample SMS data
const smsData = {
  Message: "Your SMS message goes here",
  MessageSource: "SMSProvider",
};


// Encrypt SMS data
const smsDataBuffer = Buffer.from(JSON.stringify(smsData), "utf8");
const aesGcm = crypto.createCipheriv("aes-256-gcm", sessionKey, xorResulthex);
const encryptedData = Buffer.concat([
  aesGcm.update(smsDataBuffer),
  aesGcm.final(),
]);
const tag = aesGcm.getAuthTag();

// Decrypt and print decrypted data
const aesGcmDecipher = crypto.createDecipheriv(
  "aes-256-gcm",
  sessionKey,
  xorResulthex
);
aesGcmDecipher.setAuthTag(tag);
const decryptedData = Buffer.concat([
  aesGcmDecipher.update(encryptedData),
  aesGcmDecipher.final(),
]);

console.log("Encrypted Data:", encryptedData.toString("hex"));
console.log("Authentication Tag:", tag.toString("hex"));
console.log("Decrypted Data:", decryptedData.toString("utf8"));
