const { ipcRenderer } = require('electron');

let fileContent = '';
let fullPath = '';
let fullContent = '';

async function openFile() {
    const { filePath, content } = await ipcRenderer.invoke('open-file');
    const fileContentDiv = document.getElementById('fileContent');
    const passwordInput = document.getElementById('password');
    const encryptButton = document.getElementById('encryptButton');
    const decryptButton = document.getElementById('decryptButton');

    // console.log(filePath)

    if (content) {
        fileContent = content;
        fullPath = filePath;
        fileContentDiv.textContent = filePath;
        passwordInput.disabled = false;
        encryptButton.disabled = false;
        decryptButton.disabled = false; // Disable decrypt button until encrypted content is available
    } else {
        fileContentDiv.textContent = 'No file selected or failed to open the file.';
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
            message.textContent = 'File encrypted successfully!';
            message.style.color = 'green';
            resultContentDiv.textContent = `Encrypted Content: ${encryptedContentWithIV}`;

            // Save the encrypted file
            console.log('Encrypted file saved at:', fullPath);
            const encryptedFilePath = await ipcRenderer.invoke('save-encrypted-file', fullPath, encryptedContentWithIV);
            if (encryptedFilePath) {
                console.log('Encrypted file saved at:', encryptedFilePath);
            } else {
                console.error('Failed to save encrypted file.');
            }
        } else {
            message.textContent = 'Encryption failed.';
            message.style.color = 'red';
        }
    } else {
        message.textContent = 'Please enter a password.';
        message.style.color = 'red';
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
                message.textContent = 'File decrypted successfully!';
                message.style.color = 'green';
                resultContentDiv.textContent = `Decrypted Content: ${decryptedContent}`;

                // Save the decrypted file
                console.log('Encrypted file saved at:', fullPath);
                const decryptedFilePath = await ipcRenderer.invoke('save-decrypted-file', fullPath, decryptedContent);
                if (decryptedFilePath) {
                    console.log('Encrypted file saved at:', decryptedFilePath);
                } else {
                    console.error('Failed to save decrypted file.');
                }
            } else {
                message.textContent = 'Decryption failed. Please check the password and try again.';
                message.style.color = 'red';
            }
        } catch (error) {
            console.error('Error occurred during decryption:', error);
            message.textContent = 'Decryption failed. False encryted file.';
            message.style.color = 'red';
            resultContentDiv.textContent = '';
        }
    } else {
        message.textContent = 'Please enter a password.';
        message.style.color = 'red';
    }
}

