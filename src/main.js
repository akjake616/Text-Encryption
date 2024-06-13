const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 200,
        minWidth: 500,
        minHeight: 200,
        maxWidth: 500,
        maxHeight: 200,

        icon: '../media/safe-text.ico',

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('open-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (!canceled && filePaths.length > 0) {
        const filePath = filePaths[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        return { filePath, content };
    } else {
        return null;
    }
});


ipcMain.handle('encrypt-content', (event, content, password) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(password).digest();
  const iv = crypto.randomBytes(16); // Generate IV
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(content, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  // Prepend IV to encrypted content
  const encryptedContentWithIV = iv.toString('hex') + encrypted;

  return encryptedContentWithIV;
});

ipcMain.handle('save-encrypted-file', async (event, originalFilePath, encryptedContent) => {
    const directoryPath = path.dirname(originalFilePath);
    const fileName = path.basename(originalFilePath, '.txt');
    const encryptedFilePath = path.join(directoryPath, `${fileName}_enc.txt`);

    try {
        fs.writeFileSync(encryptedFilePath, encryptedContent, 'utf-8');
        return `${fileName}_enc.txt`;
    } catch (error) {
        console.error('Error saving encrypted file:', error);
        return null;
    }
});

ipcMain.handle('decrypt-content', (event, encryptedContentWithIV, password) => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(password).digest();

  // Extract IV from encrypted content
  const iv = Buffer.from(encryptedContentWithIV.slice(0, 32), 'hex');
  const encryptedContent = encryptedContentWithIV.slice(32);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedContent, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
});

ipcMain.handle('save-decrypted-file', async (event, originalFilePath, decryptedContent) => {
  const directoryPath = path.dirname(originalFilePath);
  const fileName = path.basename(originalFilePath, '.txt');
  const encryptedFilePath = path.join(directoryPath, `${fileName}_dec.txt`);

  try {
      fs.writeFileSync(encryptedFilePath, decryptedContent, 'utf-8');
      return `${fileName}_dec.txt`;
  } catch (error) {
      console.error('Error saving encrypted file:', error);
      return null;
  }
});
