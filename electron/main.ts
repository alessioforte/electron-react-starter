import 'dotenv/config';
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  screen,
  globalShortcut,
  Tray,
  Menu,
} from 'electron';
import * as path from 'path';
import Settings from '../settings';
import theme from '../src/theme';

const backgroundColor = theme.colors.background;
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null;
let tray: Tray | null | undefined;

const webPreferences = {
  nodeIntegration: true,
  enableRemoteModule: true,
};

const winConfig: BrowserWindowConstructorOptions = {
  width: 800,
  height: 600,
  // frame: false,
  // fullscreenable: false,
  // resizable: false,
  backgroundColor: backgroundColor,
  useContentSize: true,
  show: isDev,
  webPreferences,
};

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => showWindow());
}

// const appVersion = app.getVersion();

const indexPath = isDev
  ? 'http://localhost:4000'
  : `file://${path.join(__dirname, 'renderer/index.html')}`;

// const iconPath =
//   process.platform === 'win32'
//     ? path.join(__dirname, '../assets', 'icon_16x16.ico')
//     : path.join(__dirname, '../assets', 'iconTemplate.png');

app.on('ready', appReady);

app.allowRendererProcessReuse = true;

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

process.on('uncaughtException', () => {
  console.log('uncaughtException');
});

// Init ------------------------------------------------------------------------
async function appReady() {
  if (isDev) {
    createWindow();
  } else {
    // CREATE TRAY AND CONTEXT MENU
    // tray = new Tray(iconPath);

    // const contextMenu = Menu.buildFromTemplate([
    //   { label: 'Quit', accelerator: 'Command+Q', click: app.quit },
    // ]);

    // tray.setContextMenu(contextMenu);

    // CREATE TRANSEE WINDOW IN BACKGROUND
    createWindow();
  }
}

// Create Windows --------------------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow(winConfig);
  mainWindow.loadURL(`${indexPath}?main`);
  mainWindow.visibleOnAllWorkspaces = true;
  mainWindow.on('blur', () => {
    if (!isDev) hideWindow();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -----------------------------------------------------------------------------
function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
  }
}

function showWindow() {
  if (!mainWindow) {
    createWindow();
  }

  const { x, y } = getWindowPosition();
  mainWindow.setPosition(x, y);
  mainWindow.show();
}

function getWindowPosition() {
  const point = screen.getCursorScreenPoint();
  const displayBounds = screen.getDisplayNearestPoint(point).bounds;
  const windowBounds = mainWindow.getBounds();
  let maxAppHeight = 800;
  if (displayBounds.height < 768) maxAppHeight = 768;

  const x = Math.round(
    displayBounds.x + (displayBounds.width - windowBounds.width) / 2
  );
  const y = (displayBounds.height - maxAppHeight) / 2 + displayBounds.y;

  return { x, y };
}

// IPC -------------------------------------------------------------------------
ipcMain.on('window-height', (event, height) => {
  if (mainWindow) {
    mainWindow.setSize(680, height);
    event.returnValue = true;
  }
});

ipcMain.on('hide-window', (event, msg) => {
  hideWindow();
});

ipcMain.on('set-start-login', (event, check) => {
  app.setLoginItemSettings({
    openAtLogin: check,
  });
});

ipcMain.on('change-shortcut', (event, shortcut) => {
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut, () => {
    showWindow();
  });
});

ipcMain.on('devtools', (event) => {
  mainWindow.webContents.openDevTools();
});

ipcMain.on('restore-settings', (event, msg) => {
  const check = app.getLoginItemSettings().openAtLogin;
  Settings.set('version', appVersion);
  Settings.set('show-welcome', true);
  Settings.set('start-login', check);
  Settings.set('shortcut', 'Ctrl+Alt+T');
  app.relaunch();
  app.exit(0);
});
