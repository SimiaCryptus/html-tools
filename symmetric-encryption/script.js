document.addEventListener('DOMContentLoaded', function () {
    // Event listener for the encrypt button
    document.getElementById('encrypt-btn').addEventListener('click', function () {
        const secretKey = document.getElementById('secret-key').value;
        const plaintext = document.getElementById('plaintext').value;
        if (secretKey && plaintext) {
            const encrypted = encrypt(plaintext, secretKey);
            document.getElementById('encrypted').value = encrypted;
        } else {
            alert('Please enter both secret key and plaintext.');
        }
    });

    // Event listener for the decrypt button
    document.getElementById('decrypt-btn').addEventListener('click', function () {
        const secretKey = document.getElementById('secret-key').value;
        const encrypted = document.getElementById('encrypted').value;
        if (secretKey && encrypted) {
            const decrypted = decrypt(encrypted, secretKey);
            document.getElementById('plaintext').value = decrypted;
        } else {
            alert('Please enter both secret key and encrypted data.');
        }
    });

    // Simple encryption function (for demonstration purposes only)
    function encrypt(plaintext, key) {
        // Convert the plaintext and key to Uint8Array
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const keyData = encoder.encode(key);

        // Encrypt the data using a simple XOR with the key
        const encryptedData = data.map((byte, index) => byte ^ keyData[index % keyData.length]);

        // Convert the Uint8Array to base64 string
        const base64String = btoa(String.fromCharCode.apply(null, encryptedData));
        return base64String;
    }

    // Simple decryption function (for demonstration purposes only)
    function decrypt(encrypted, key) {
        // Decode the base64 string to Uint8Array
        const binaryString = atob(encrypted);
        const encryptedData = new Uint8Array([...binaryString].map(char => char.charCodeAt(0)));

        // Decode the key to Uint8Array
        const encoder = new TextEncoder();
        const keyData = encoder.encode(key);

        // Decrypt the data using a simple XOR with the key
        const decryptedData = encryptedData.map((byte, index) => byte ^ keyData[index % keyData.length]);

        // Decode the Uint8Array to string
        const decoder = new TextDecoder();
        const decodedString = decoder.decode(decryptedData);

        return decodedString;
    }
});