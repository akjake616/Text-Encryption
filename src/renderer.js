const { ipcRenderer } = require('electron');

let fileContent = '';
let fullPath = '';
let fullContent = '';

async function openFile() {
    const { filePath, content } = await ipcRenderer.invoke('open-file');
    const passwordInput = document.getElementById('password');
    const encryptButton = document.getElementById('encryptButton');
    const decryptButton = document.getElementById('decryptButton');
    const pathDisplay = document.getElementById('pathDisplay');

    // console.log(filePath)

    if (content) {
        fileContent = content;
        fullPath = filePath;
        pathDisplay.textContent = filePath;
        passwordInput.disabled = false;
        encryptButton.disabled = false;
        decryptButton.disabled = false; // Disable decrypt button until encrypted content is available
    } else {
        pathDisplay.textContent = 'No file selected or failed to open the file.';
        passwordInput.disabled = true;
        encryptButton.disabled = true;
        decryptButton.disabled = true;
    }
}

async function encryptContent() {
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    const resultContentDiv = document.getElementById('resultContent');

    if (password) {
        const encryptedContentWithIV = await ipcRenderer.invoke('encrypt-content', fileContent, password);
        if (encryptedContentWithIV) {
            fullContent = encryptedContentWithIV;

            // Save the encrypted file
            console.log('Encrypted file saved at:', fullPath);
            const encryptedFileName = await ipcRenderer.invoke('save-encrypted-file', fullPath, encryptedContentWithIV);
            if (encryptedFileName) {
                // console.log('Encrypted file saved at:', encryptedFileName);
                // message.textContent = `File encrypted successfully!`;
                // message.style.color = 'green';
                // resultContentDiv.textContent = `Encrypted file name: ${encryptedFileName}`;

                const title = `File encrypted successfully!`;
                const body = `Encrypted file name: ${encryptedFileName}`;
                new Notification(title, { body: body }).show()
            } else {
                console.error('Failed to save encrypted file.');

                const title = 'Failed to save encrypted file.';
                const body = ` `;
                new Notification(title, { body: body }).show()
            }

        } else {
            // message.textContent = 'Encryption failed.';
            // message.style.color = 'red';

            const title = 'Encryption failed.';
            const body = ` `;
            new Notification(title, { body: body }).show()
        }
    } else {
        // message.textContent = 'Please enter a password.';
        // message.style.color = 'red';

        const title = 'Please enter a password.';
        const body = ` `;
        new Notification(title, { body: body }).show()
    }
}

async function decryptContent() {
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    const resultContentDiv = document.getElementById('resultContent');

    if (password) {
        try {
            const decryptedContent = await ipcRenderer.invoke('decrypt-content', fileContent, password);
            if (decryptedContent) {

                // Save the decrypted file
                console.log('Decrypted file saved at:', fullPath);
                const decryptedFileName = await ipcRenderer.invoke('save-decrypted-file', fullPath, decryptedContent);
                if (decryptedFileName) {
                    // console.log('Dncrypted file saved at:', decryptedFileName);
                    // message.textContent = 'File decrypted successfully!';
                    // message.style.color = 'green';
                    // resultContentDiv.textContent = `Decrypted file name: ${decryptedFileName}`;

                    const title = 'File decrypted successfully!';
                    const body = `Decrypted file name: ${decryptedFileName}`;
                    new Notification(title, { body: body }).show()
                } else {
                    console.error('Failed to save decrypted file.');

                    const title = 'Failed to save decrypted file.';
                    const body = ``;
                    new Notification(title, { body: body }).show()
                }
            } else {
                // message.textContent = 'Decryption failed. Please check the password and try again.';
                // message.style.color = 'red';

                const title = 'Decryption failed. Please check the password and try again.';
                const body = ` `;
                new Notification(title, { body: body }).show()
            }
        } catch (error) {
            console.error('Error occurred during decryption:', error);
            // message.textContent = 'Decryption failed. False password or encrypted file.';
            // message.style.color = 'red';
            // resultContentDiv.textContent = '';

            const title = 'Decryption failed. False password or encrypted file.';
            const body = ` `;
            new Notification(title, { body: body }).show()
        }
    } else {
        // message.textContent = 'Please enter a password.';
        // message.style.color = 'red';

        const title = 'Please enter a password.';
        const body = ` `;
        new Notification(title, { body: body }).show()
    }
}

