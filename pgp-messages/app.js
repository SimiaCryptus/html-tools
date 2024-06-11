// Function to handle the encryption process
document.getElementById('encrypt-button').addEventListener('click', async () => {
    // Get the message and public key from the textareas
    const message = document.getElementById('message-to-encrypt').value;
    const publicKeyArmored = document.getElementById('public-key').value;

    try {
        // Read the public key
        const publicKey = await openpgp.readKey({armoredKey: publicKeyArmored});

        // Encrypt the message
        const encryptedMessage = await openpgp.encrypt({
            message: await openpgp.createMessage({text: message}),
            encryptionKeys: publicKey
        });

        // Display the encrypted message
        document.getElementById('encrypted-message').value = encryptedMessage;
    } catch (error) {
        console.error('Error encrypting message:', error);
        alert('Failed to encrypt the message. Please check the public key and try again.');
    }
});

document.getElementById('decrypt-button').addEventListener('click', async () => {
    // Get the encrypted message, private key, and passphrase from the textareas and input
    const encryptedMessage = document.getElementById('message-to-decrypt').value;
    const privateKeyArmored = document.getElementById('private-key').value;
    const passphrase = document.getElementById('passphrase').value;

    try {
        // Read and decrypt the private key
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({armoredKey: privateKeyArmored}),
            passphrase
        });

        // Read the encrypted message
        const message = await openpgp.readMessage({
            armoredMessage: encryptedMessage
        });

        // Decrypt the message
        const {data: decryptedMessage} = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });

        // Display the decrypted message
        document.getElementById('decrypted-message').value = decryptedMessage;
    } catch (error) {
        console.error('Error decrypting message:', error);
        alert('Failed to decrypt the message. Please check the private key, passphrase, and encrypted message, and try again.');
    }
});

document.getElementById('generate-key-button').addEventListener('click', async () => {
    const name = document.getElementById('key-name').value;
    const email = document.getElementById('key-email').value;
    const passphrase = document.getElementById('key-passphrase').value;

    // Debugging information
    console.log('Generating keys with the following details:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Passphrase:', passphrase);

    // Check if any of the required fields are empty
    if (!name || !email || !passphrase) {
        alert('Name, email, and passphrase are required to generate keys.');
        return;
    }

    try {
        openpgp.generateKey({
            type: 'ecc', // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: [{name: name.trim(), email: email.trim()}],
            format: 'armored',
            passphrase: passphrase.trim()
        }).then((key) => {
            // Display the generated keys
            document.getElementById('generated-public-key').value = key.publicKey;
            document.getElementById('generated-private-key').value = key.privateKey;
        });
    } catch (error) {
        console.error('Error generating keys:', error);
        alert('Failed to generate keys. Please try again.');
    }
});