document.addEventListener('DOMContentLoaded', function () {
    // Event listener for the hash button
    document.getElementById('hash-btn').addEventListener('click', async function () {
        const inputText = document.getElementById('input-text').value;
        if (inputText) {
            const hashed = await hash(inputText);
            document.getElementById('hashed').value = hashed;
        } else {
            alert('Please enter some text to hash.');
        }
    });

    // Hashing function using SHA-256
    async function hash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }
});
