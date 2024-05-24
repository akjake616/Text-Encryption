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
        decryptButton.disabled = false; 
    } else {
        pathDisplay.textContent = 'No file selected or failed to open the file.';
        passwordInput.disabled = true;
        encryptButton.disabled = true;
        decryptButton.disabled = true;
    }
}

async function encryptContent() {
    const password = document.getElementById('password').value;
    const passwordBox = document.getElementById('password');

    if (password) {
        const encryptedContentWithIV = await ipcRenderer.invoke('encrypt-content', fileContent, password);
        if (encryptedContentWithIV) {
            fullContent = encryptedContentWithIV;

            // Save the encrypted file
            console.log('Encrypted file saved at:', fullPath);
            const encryptedFileName = await ipcRenderer.invoke('save-encrypted-file', fullPath, encryptedContentWithIV);
            if (encryptedFileName) {
                const title = `File encrypted successfully!`;
                const body = `Encrypted file name: ${encryptedFileName}`;
                new Notification(title, { body: body })
            } else {
                console.error('Failed to save encrypted file.');

                setErrorAlert(passwordBox);

                const title = 'Failed to save encrypted file.';
                const body = ` `;
                new Notification(title, { body: body })
            }

        } else {
            setErrorAlert(passwordBox);

            const title = 'Encryption failed.';
            const body = ` `;
            new Notification(title, { body: body })
        }
    } else {
        setErrorAlert(passwordBox);

        const title = 'Please enter a password.';
        const body = ` `;
        new Notification(title, { body: body })
    }
}

async function decryptContent() {
    const password = document.getElementById('password').value;
    const passwordBox = document.getElementById('password');

    if (password) {
        try {
            const decryptedContent = await ipcRenderer.invoke('decrypt-content', fileContent, password);
            if (decryptedContent) {

                // Save the decrypted file
                const decryptedFileName = await ipcRenderer.invoke('save-decrypted-file', fullPath, decryptedContent);
                if (decryptedFileName) {
                    const title = 'File decrypted successfully!';
                    const body = `Decrypted file name: ${decryptedFileName}`;
                    new Notification(title, { body: body });
                } else {
                    console.error('Failed to save decrypted file.');

                    setErrorAlert(passwordBox);

                    const title = 'Failed to save decrypted file.';
                    const body = ` `;
                    new Notification(title, { body: body });
                }
            } else {
                setErrorAlert(passwordBox);

                const title = 'Decryption failed. Please check the password and try again.';
                const body = ` `;
                new Notification(title, { body: body });
            }
        } catch (e) {
            console.error('Error occurred during decryption:', e);

            setErrorAlert(passwordBox);
            
            const title = 'Decryption failed. False password or encrypted file.';
            const body = ` `;
            new Notification(title, { body: body });
        }
    } else {
        setErrorAlert(passwordBox);

        const title = 'Please enter a password.';
        const body = ` `;
        new Notification(title, { body: body });
    }
}

async function setErrorAlert(passwordBox) {
    passwordBox.classList.add('error');
    setTimeout(() => {
        passwordBox.classList.remove('error');
    }, 300);
}

