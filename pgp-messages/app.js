// Function to switch tabs
function openTab(event, tabName) {
    console.log(`Switching to tab: ${tabName}`);
    hideQRCode(); // Hide QR code when switching tabs
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabName).style.display = 'block';
    document.getElementById(tabName).classList.add('active');

    // Update active tab
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    event.currentTarget.classList.add('active');
    console.log(`Tab switched to: ${tabName}`);
}

// Initialize tabs
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded. Initializing application...');
    loadContacts();
    importKeyFromURL();
    const firstTabButton = document.querySelector('.tab-button');
    if (firstTabButton) {
        console.log('Clicking first tab button');
        firstTabButton.click();
    } else {
        console.warn('No tab buttons found');
        alert('Key not found');
    }
    console.log('Application initialized');
});

function confirmDeleteKey(alias, keyType) {
    console.log(`Confirming deletion of ${keyType} key for alias: ${alias}`);
    if (confirm(`Are you sure you want to delete the ${keyType} key for ${alias}?`)) {
        deleteKey(alias, keyType);
    }
}

function deleteKey(alias, keyType) {
    console.log(`Deleting ${keyType} key for alias: ${alias}`);
    if (keyType === 'public') {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
        delete contacts[alias];
        localStorage.setItem('contacts', JSON.stringify(contacts));
        console.log(`Public key deleted for alias: ${alias}`);
    } else if (keyType === 'private') {
        const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
        delete generatedKeys[alias];
        localStorage.setItem('generatedKeys', JSON.stringify(generatedKeys));
        console.log(`Private key deleted for alias: ${alias}`);
    }

    // Update the UI
    loadContacts();
    modal.style.display = 'none';
    console.log('UI updated after key deletion');
}

// Function to handle the encryption process
document.getElementById('encrypt-button').addEventListener('click', async () => {
    console.log('Encryption process started');
    // Get the message and public key from the textareas
    const message = document.getElementById('message-to-encrypt').value;
    const publicKeyAlias = document.getElementById('public-key-select').value;

    if (!publicKeyAlias) {
        console.warn('No public key selected for encryption');
        alert('Please select a public key.');
        return;
    }

    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    const publicKeyArmored = contacts[publicKeyAlias].publicKey;
    console.log(`Using public key for alias: ${publicKeyAlias}`);

    try {
        // Read the public key
        const publicKey = await openpgp.readKey({armoredKey: publicKeyArmored});
        console.log('Public key read successfully');

        // Encrypt the message
        const encryptedMessage = await openpgp.encrypt({
            message: await openpgp.createMessage({text: message}),
            encryptionKeys: publicKey
        });
        console.log('Message encrypted successfully');

        // Display the encrypted message
        document.getElementById('encrypted-message').value = encryptedMessage;
        console.log('Encrypted message displayed');
    } catch (error) {
        console.error('Error encrypting message:', error);
        alert('Failed to encrypt the message. Please check the public key and try again.');
    }
});

document.getElementById('decrypt-button').addEventListener('click', async () => {
    console.log('Decryption process started');
    // Get the encrypted message, private key, and passphrase from the textareas and input
    const encryptedMessage = document.getElementById('message-to-decrypt').value;
    const privateKeyAlias = document.getElementById('private-key-select').value;
    const passphrase = document.getElementById('passphrase').value;

    if (!privateKeyAlias) {
        console.warn('No private key selected for decryption');
        alert('Please select a private key.');
        return;
    }

    const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
    const privateKeyArmored = generatedKeys[privateKeyAlias].privateKey;
    console.log(`Using private key for alias: ${privateKeyAlias}`);

    try {
        // Read and decrypt the private key
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readPrivateKey({armoredKey: privateKeyArmored}),
            passphrase
        });
        console.log('Private key decrypted successfully');

        // Read the encrypted message
        const message = await openpgp.readMessage({
            armoredMessage: encryptedMessage
        });
        console.log('Encrypted message read successfully');

        // Decrypt the message
        const {data: decryptedMessage} = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });
        console.log('Message decrypted successfully');

        // Display the decrypted message
        document.getElementById('decrypted-message').value = decryptedMessage;
        console.log('Decrypted message displayed');
    } catch (error) {
        console.error('Error decrypting message:', error);
        alert('Failed to decrypt the message. Please check the private key, passphrase, and encrypted message, and try again.');
    }
});

// Function to populate key dropdowns
function populateKeyDropdowns() {
    console.log('Populating key dropdowns');
    const publicKeySelect = document.getElementById('public-key-select');
    const privateKeySelect = document.getElementById('private-key-select');

    // Clear existing options
    if (publicKeySelect) {
        publicKeySelect.innerHTML = '<option value="">Select recipient\'s public key</option>';
        console.log('Public key dropdown cleared');
    }
    if (privateKeySelect) {
        privateKeySelect.innerHTML = '<option value="">Select your private key</option>';
        console.log('Private key dropdown cleared');
    }

    // Populate public keys
    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    if (publicKeySelect) {
        console.log(`Populating ${Object.keys(contacts).length} public keys`);
        for (const [alias, contact] of Object.entries(contacts)) {
            const option = document.createElement('option');
            option.value = alias;
            option.textContent = `${alias} (${contact.name})`;
            publicKeySelect.appendChild(option);
        }
    }

    // Populate private keys
    const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
    if (privateKeySelect) {
        console.log(`Populating ${Object.keys(generatedKeys).length} private keys`);
        for (const [alias, key] of Object.entries(generatedKeys)) {
            const option = document.createElement('option');
            option.value = alias;
            option.textContent = `${alias} (${key.name})`;
            privateKeySelect.appendChild(option);
        }
    }
    console.log('Key dropdowns populated');
}

document.getElementById('generate-key-button').addEventListener('click', async () => {
    console.log('Key generation process started');
    const name = document.getElementById('key-name').value;
    const email = document.getElementById('key-email').value;
    const passphrase = document.getElementById('key-passphrase').value;
    const alias = document.getElementById('key-alias').value;

    // Debugging information
    console.log(`Generating keys for: Name: ${name}, Email: ${email}, Alias: ${alias}`);

    // Check if any of the required fields are empty
    if (!name || !email || !passphrase || !alias) {
        console.warn('Missing required fields for key generation');
        alert('Name, email, passphrase, and alias are required to generate keys.');
        return;
    }

    try {
        console.log('Generating OpenPGP key pair...');
        const key = await openpgp.generateKey({
            type: 'ecc', // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: [{name: name.trim(), email: email.trim()}],
            format: 'armored',
            passphrase: passphrase.trim()
        });
        console.log('Key pair generated successfully');

        // Display the generated keys
        document.getElementById('generated-public-key').value = key.publicKey;
        document.getElementById('generated-private-key').value = key.privateKey;
        console.log('Generated keys displayed');

        // Add to address book
        addToAddressBook(alias, name, email, key.publicKey);
        console.log(`Public key added to address book for alias: ${alias}`);

        // Save generated keys to local storage
        saveGeneratedKeys(alias, name, email, key.publicKey, key.privateKey);
        console.log(`Generated keys saved to local storage for alias: ${alias}`);

        addToPrivateKeysTable(alias, name, email);
        console.log(`Private key added to table for alias: ${alias}`);
    } catch (error) {
        console.error('Error generating keys:', error);
        alert('Failed to generate keys. Please try again.');
    }
});

// Function to add a contact to the address book
function addToAddressBook(alias, name, email, publicKey, keyType = 'public') {
    const addressBook = document.getElementById('address-book-table').getElementsByTagName('tbody')[0];
    if (!addressBook) {
        console.error('Address book element not found');
        return;
    }
    const row = addressBook.insertRow();
    row.insertCell(0).innerHTML = `<a href="#" class="key-link" data-alias="${alias}" data-type="${keyType}">${alias}</a>`;
    row.insertCell(1).innerHTML = name;
    row.insertCell(2).innerHTML = email;
    
    if (keyType === 'private') {
        const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
        generatedKeys[alias] = {name, email, publicKey};
        localStorage.setItem('generatedKeys', JSON.stringify(generatedKeys));
    } else {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
        contacts[alias] = {name, email, publicKey};
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }
}

// Function to add a private key to the table
function addToPrivateKeysTable(alias, name, email, keyType) {
    const privateKeysTable = document.getElementById('private-keys-table').getElementsByTagName('tbody')[0];
    if (!privateKeysTable) {
        console.error('Private keys table not found');
        return;
    }
    const row = privateKeysTable.insertRow();
    row.insertCell(0).innerHTML = `<a href="#" class="key-link" data-alias="${alias}" data-type="private">${alias}</a>`;
    row.insertCell(1).innerHTML = name;
    row.insertCell(2).innerHTML = email;
}

// Function to save generated keys to local storage
function saveGeneratedKeys(alias, name, email, publicKey, privateKey) {
    const keys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
    keys[alias] = {name, email, publicKey, privateKey};
    localStorage.setItem('generatedKeys', JSON.stringify(keys));
}

// Function to clear key generation fields
function clearKeyGenerationFields() {
    document.getElementById('key-name').value = '';
    document.getElementById('key-email').value = '';
    document.getElementById('key-passphrase').value = '';
    document.getElementById('key-alias').value = '';
    document.getElementById('generated-public-key').value = '';
    document.getElementById('generated-private-key').value = '';
}

// Function to import a contact
document.getElementById('import-contact-button').addEventListener('click', () => {
    const alias = document.getElementById('import-alias').value;
    const name = document.getElementById('import-name').value;
    const email = document.getElementById('import-email').value;
    const publicKey = document.getElementById('import-public-key').value;

    if (!alias || !name || !email || !publicKey) {
        alert('All fields are required to import a contact.');
        return;
    }

    addToAddressBook(alias, name, email, publicKey);
    loadContacts();

    // Close the modal

    // Clear import fields
    document.getElementById('import-alias').value = '';
    document.getElementById('import-name').value = '';
    document.getElementById('import-email').value = '';
    document.getElementById('import-public-key').value = '';
});

// Function to load contacts from local storage
function loadContacts() {
    const addressBook = document.getElementById('address-book-table').getElementsByTagName('tbody')[0];
    const privateKeysTable = document.getElementById('private-keys-table').getElementsByTagName('tbody')[0];

    // Clear existing rows
    addressBook.innerHTML = '';
    privateKeysTable.innerHTML = '';

    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (const [alias, contact] of Object.entries(contacts)) {
        addToAddressBook(alias, contact.name, contact.email, contact.publicKey);
    }

    const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
    for (const [alias, key] of Object.entries(generatedKeys)) {
        addToPrivateKeysTable(alias, key.name, key.email, 'private');
    }

    // Populate key dropdowns
    populateKeyDropdowns();
}

// Call loadContacts when the page loads
document.addEventListener('DOMContentLoaded', loadContacts);

// Modal functionality
const modal = document.getElementById('key-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-key-content');
const closeBtn = document.getElementsByClassName('close')[0];
const deleteKeyBtn = document.getElementById('delete-key-button');

// Close modal when clicking the close button or outside the modal
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
        hideQRCode(); // Hide QR code when clicking outside modal
    }
};

// Event delegation for key links
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('key-link')) {
        const alias = event.target.dataset.alias;
        const keyType = event.target.dataset.type;
        showKeyModal(alias, keyType);
    }
});

function showKeyModal(alias, keyType) {
    let keyDetails = {};
    if (keyType === 'public') {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
        keyDetails = contacts[alias] || {};
        modalTitle.textContent = `Public Key for ${alias}`;
    } else if (keyType === 'private') {
        const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
        keyDetails = generatedKeys[alias] || {};
        modalTitle.textContent = `Private Key for ${alias}`;
    }

    if (Object.keys(keyDetails).length > 0) {
        const bookmarkData = encodeURIComponent(JSON.stringify({
            alias: alias,
            name: keyDetails.name,
            email: keyDetails.email,
            publicKey: encodeURIComponent(keyDetails.publicKey)
        }));
        const baseUrl = window.location.href.split('#')[0]; // Strip any existing hash
        const bookmarkLink = `${baseUrl}#?import=${bookmarkData}`;
        let detailsHTML = `
            <p><strong>Alias:</strong> ${alias}</p>
            <p><strong>Name:</strong> ${keyDetails.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${keyDetails.email || 'N/A'}</p>
            <textarea readonly>${keyType === 'public' ? keyDetails.publicKey : keyDetails.privateKey}</textarea>
            ${keyType === 'public' ? `<p><a href="${bookmarkLink}" id="bookmark-link">Bookmark this public key</a></p>` : ''}
        `;
        modalContent.innerHTML = detailsHTML;
        modal.style.display = 'block';
        deleteKeyBtn.onclick = () => {
            confirmDeleteKey(alias, keyType);
            hideQRCode(); // Hide QR code when deleting key
            loadContacts();
        }
        generateQRCode(bookmarkLink); // Generate QR code for bookmark link
    } else {
        hideQRCode(); // Hide QR code if no key details are found
        alert(`No ${keyType} key found for alias: ${alias}`);
    }
}
 // Function to hide QR code
 function hideQRCode() {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
     if(qrCodeContainer) qrCodeContainer.style.display = 'none';
 }
 
 closeBtn.onclick = () => {
     modal.style.display = 'none';
     hideQRCode(); // Hide QR code when closing modal
};

// Function to import key from URL parameters
function importKeyFromURL() {
    const hash = window.location.hash;
    const importData = hash.startsWith('#?import=') ? hash.slice(9) : null;
    if (importData) {
        try {
            // First, try to parse as-is
            let keyData;
            try {
                keyData = JSON.parse(decodeURIComponent(importData));
            } catch (e) {
                console.error('Error parsing import data:', e);
                throw e; // Re-throw to be caught by the outer try-catch
            }
            
            // Decode the public key separately, as it might contain newlines
            keyData.publicKey = decodeURIComponent(keyData.publicKey).replace(/\\n/g, '\n');

            addToAddressBook(keyData.alias, keyData.name, keyData.email, keyData.publicKey);
            loadContacts();
            // Set the imported key as the default selection in the public key dropdown
            setDefaultPublicKey(keyData.alias);
            alert(`Public key for ${keyData.alias} has been imported successfully.`);
        } catch (error) {
            console.error('Error importing key from URL:', error);
            alert('Failed to import key from URL. The data might be corrupted or invalid.');
        }
    }
}

// Function to generate QR code for public key
async function generateQRCode(publicKey) {
    const qrCodeElement = document.getElementById('qrCode');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(bookmarkLink, {
            errorCorrectionLevel: 'H',
            width: 256,
            height: 256,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        qrCodeElement.src = qrCodeDataUrl;
        qrCodeContainer.style.display = 'block';
    } catch (err) {
        console.error('Failed to generate QR code:', err);
    }
}

// Helper function to set the default public key in the dropdown
function setDefaultPublicKey(alias) {
    const publicKeySelect = document.getElementById('public-key-select');
    if (publicKeySelect) {
        const publicKeySelect = document.getElementById('public-key-select');
        if (publicKeySelect) {
            for (let i = 0; i < publicKeySelect.options.length; i++) {
                if (publicKeySelect.options[i].value === alias) {
                    publicKeySelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
}