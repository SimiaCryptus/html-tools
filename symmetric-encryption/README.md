# Symmetric Encryption Tool

This is a simple web-based tool for symmetric encryption and decryption using a secret key. The encryption method used
here is a basic XOR operation, which is not secure for real-world applications but serves as a demonstration.

## Files

- `index.html`: The main HTML file that contains the structure of the web page.
- `script.js`: The JavaScript file that handles the encryption and decryption logic.
- `styles.css`: The CSS file that styles the web page.

## How to Use

1. Open `index.html` in a web browser.
2. Enter a secret key in the "Secret Key" input field.
3. Enter the plaintext you want to encrypt in the "Plaintext" textarea.
4. Click the "Encrypt" button to encrypt the plaintext. The encrypted data will appear in the "Base64-Encoded Binary (
   Encrypted Data)" textarea.
5. To decrypt, enter the secret key and the encrypted data, then click the "Decrypt" button. The decrypted plaintext
   will appear in the "Plaintext" textarea.

## Encryption and Decryption Logic

The encryption and decryption functions use a simple XOR operation with the secret key. The plaintext and key are first
converted to `Uint8Array` objects. The XOR operation is performed byte by byte, and the result is encoded in base64 for
display.

### Encryption Function

