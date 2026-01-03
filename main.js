const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true, // メニューバーを非表示
  });

  // 開発環境か本番環境かでURLを切り替え
  const url = isDev
    ? 'http://localhost:3005'
    : 'https://tensaku-kun.vercel.app/';

  mainWindow.loadURL(url);

  // 【修正ポイント】製品版ではデベロッパーツールを閉じる設定
  // 開発中だけ確認したい場合は、下の行の // を消してください
  // if (isDev) { mainWindow.webContents.openDevTools(); }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});