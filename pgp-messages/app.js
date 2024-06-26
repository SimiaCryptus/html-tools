// Function to switch tabs
function openTab(event, tabName) {
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
}

// Initialize tabs
document.addEventListener('DOMContentLoaded', () => {
    const firstTabButton = document.querySelector('.tab-button');
    if (firstTabButton) {
        firstTabButton.click();
    } else {
        alert('Key not found');
    }
});

function confirmDeleteKey(alias, keyType) {
    if (confirm(`Are you sure you want to delete the ${keyType} key for ${alias}?`)) {
        deleteKey(alias, keyType);
    }
}

function deleteKey(alias, keyType) {
    if (keyType === 'public') {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
        delete contacts[alias];
        localStorage.setItem('contacts', JSON.stringify(contacts));
    } else if (keyType === 'private') {
        const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
        delete generatedKeys[alias];
        localStorage.setItem('generatedKeys', JSON.stringify(generatedKeys));
    }

    // Update the UI
    loadContacts();
    modal.style.display = 'none';
}

// Function to handle the encryption process
document.getElementById('encrypt-button').addEventListener('click', async () => {
    // Get the message and public key from the textareas
    const message = document.getElementById('message-to-encrypt').value;
    const publicKeyAlias = document.getElementById('public-key-select').value;
    
    if (!publicKeyAlias) {
        alert('Please select a public key.');
        return;
    }

    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    const publicKeyArmored = contacts[publicKeyAlias].publicKey;

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
    const privateKeyAlias = document.getElementById('private-key-select').value;
    const passphrase = document.getElementById('passphrase').value;

    if (!privateKeyAlias) {
        alert('Please select a private key.');
        return;
    }

    const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
    const privateKeyArmored = generatedKeys[privateKeyAlias].privateKey;

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

// Function to populate key dropdowns
function populateKeyDropdowns() {
    const publicKeySelect = document.getElementById('public-key-select');
    const privateKeySelect = document.getElementById('private-key-select');

    // Clear existing options
    publicKeySelect.innerHTML = '<option value="">Select recipient\'s public key</option>';
    privateKeySelect.innerHTML = '<option value="">Select your private key</option>';

    // Populate public keys
    const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
    for (const [alias, contact] of Object.entries(contacts)) {
        const option = document.createElement('option');
        option.value = alias;
        option.textContent = `${alias} (${contact.name})`;
        publicKeySelect.appendChild(option);
    }

    // Populate private keys
    const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
    for (const [alias, key] of Object.entries(generatedKeys)) {
        const option = document.createElement('option');
        option.value = alias;
        option.textContent = `${alias} (${key.name})`;
        privateKeySelect.appendChild(option);
    }
}
document.getElementById('generate-key-button').addEventListener('click', async () => {
    const name = document.getElementById('key-name').value;
    const email = document.getElementById('key-email').value;
    const passphrase = document.getElementById('key-passphrase').value;
    const alias = document.getElementById('key-alias').value;

    // Debugging information
    console.log('Generating keys with the following details:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Passphrase:', passphrase);

    // Check if any of the required fields are empty
    if (!name || !email || !passphrase || !alias) {
        alert('Name, email, passphrase, and alias are required to generate keys.');
        return;
    }

    try {
        const key = await openpgp.generateKey({
            type: 'ecc', // Type of the key, defaults to ECC
            curve: 'curve25519', // ECC curve name, defaults to curve25519
            userIDs: [{name: name.trim(), email: email.trim()}],
            format: 'armored',
            passphrase: passphrase.trim()
        });

        // Display the generated keys
        document.getElementById('generated-public-key').value = key.publicKey;
        document.getElementById('generated-private-key').value = key.privateKey;

        // Add to address book
        addToAddressBook(alias, name, email, key.publicKey);

        // Save generated keys to local storage
        saveGeneratedKeys(alias, name, email, key.publicKey, key.privateKey);
        addToPrivateKeysTable(alias, name, email);
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

    // Store public key in a hidden textarea
    const publicKeyTextarea = document.createElement('textarea');
    publicKeyTextarea.id = `public-key-${alias}`;
    publicKeyTextarea.style.display = 'none';
    publicKeyTextarea.value = publicKey;
    document.body.appendChild(publicKeyTextarea);

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
    let keyContent;
    if (keyType === 'public') {
        const contacts = JSON.parse(localStorage.getItem('contacts') || '{}');
        keyContent = contacts[alias]?.publicKey;
        modalTitle.textContent = `Public Key for ${alias}`;
    } else if (keyType === 'private') {
        const generatedKeys = JSON.parse(localStorage.getItem('generatedKeys') || '{}');
        keyContent = generatedKeys[alias]?.privateKey;
        modalTitle.textContent = `Private Key for ${alias}`;
    }

    if (keyContent) {
        modalContent.value = keyContent;
        modal.style.display = 'block';
        deleteKeyBtn.onclick = () => {
            confirmDeleteKey(alias, keyType);
            loadContacts();
        }
    }
}