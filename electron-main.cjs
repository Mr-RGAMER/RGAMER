const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'RGAMER AI - Power Model',
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'public', 'favicon.ico')
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ==========================================
// 🚀 RGAMER POWER MODEL - LOCAL IPC HANDLERS
// ==========================================

// 1. Get System Specs
ipcMain.handle('get-system-specs', () => {
  try {
    const totalRamGB = Math.round(os.totalmem() / 1024 / 1024 / 1024);
    const freeRamGB = Math.round(os.freemem() / 1024 / 1024 / 1024);
    return {
      cpu: os.cpus()[0].model,
      cores: os.cpus().length,
      ram: `${totalRamGB} GB (Free: ${freeRamGB} GB)`,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
    };
  } catch (err) {
    return { error: 'Could not fetch specs' };
  }
});

// 2. Handle Python script execution
ipcMain.handle('execute-blender-script', async (event, scriptContent) => {
  try {
    // Write the script to a specific public path that the Blender Add-on will constantly check
    const publicDocPath = path.join(app.getPath('documents'), 'rgamer_live_bridge.py');
    fs.writeFileSync(publicDocPath, scriptContent);
    
    // We do NOT open a background blender anymore.
    // The open Blender window with our Add-on installed will read this file, execute it, and delete it!
    return { success: true, output: "Script sent to Live Blender Bridge!" };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
