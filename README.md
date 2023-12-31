# ECDH-AES-GCM
Let's break down the steps of the algorithm you used:

### Algorithm Overview:

1. **Key Pair Generation:**
   - Generate an asymmetric key pair using the X25519 elliptic curve algorithm.
   - The generated key pair includes a private key and a corresponding public key.

2. **Session Key Derivation:**
   - Convert the public key into DER format.
   - Use the private key and the server's public key to derive a session key using the HKDF (HMAC-based Key Derivation Function) algorithm. HKDF is used to securely derive keys from shared secrets.

3. **Nonce Generation and XOR Operation:**
   - Generate a random 32-byte nonce on the client-side.
   - Receive a server nonce in base64 format and convert it into a buffer.
   - Perform an XOR operation between the client's nonce and the server's nonce to create an Initialization Vector (IV) for encryption.

4. **SMS Data Handling:**
   - Prepare the SMS data as a JSON object.
   - Convert the JSON object into a UTF-8 encoded buffer.

5. **Encryption (AES-GCM):**
   - Create an AES-GCM cipher using the derived session key and the XORed nonce as the IV.
   - Encrypt the SMS data buffer using AES-GCM, which provides both confidentiality and integrity of the data.
   - Retrieve the authentication tag generated during encryption for integrity verification.

6. **Decryption (AES-GCM):**
   - Create an AES-GCM decipher using the derived session key and the XORed nonce as the IV.
   - Set the authentication tag obtained during encryption for integrity verification.
   - Decrypt the encrypted data buffer using AES-GCM.
   - Output the decrypted data, which should match the original SMS data.

### Detailed Explanation:

1. **Key Pair Generation:**
   - X25519 is used to generate an elliptic curve key pair, providing a secure way to establish a shared secret between the client and the server.

2. **Session Key Derivation:**
   - The public key is converted to DER format and used along with the private key to derive a shared secret (session key) using HKDF. HKDF ensures that the derived key is secure for further use.

3. **Nonce Generation and XOR Operation:**
   - A nonce is generated on the client-side, and a server nonce is received.
   - The XOR operation between the client's nonce and the server's nonce creates a unique IV, ensuring the uniqueness of each encryption operation.

4. **SMS Data Handling:**
   - The SMS data is prepared as a JSON object.
   - It is converted into a buffer of bytes using UTF-8 encoding, allowing it to be processed by cryptographic algorithms.

5. **Encryption (AES-GCM):**
   - AES-GCM encryption is employed, providing both encryption (confidentiality) and authentication (integrity) of the data.
   - The session key derived from the shared secret and the XORed nonce are used to initialize the AES-GCM cipher.
   - The SMS data buffer is encrypted, producing ciphertext, and an authentication tag is generated, ensuring data integrity.

6. **Decryption (AES-GCM):**
   - The same session key and XORed nonce are used to initialize the AES-GCM decipher.
   - The authentication tag is set for integrity verification.
   - The encrypted data is decrypted, producing the original SMS data buffer.
   - The authentication tag is used to verify that the decrypted data has not been tampered with.
//
This algorithm ensures secure communication between the client and server, protecting the confidentiality and integrity of the exchanged SMS data. It employs industry-standard cryptographic primitives and protocols, providing a robust and secure solution for data exchange.