const {app, BrowserWindow, ipcMain, dialog} = require('electron')

let mainWindow
let addMusicWindow

class appWindow extends BrowserWindow{
    constructor(config, filePath) {
        let baseConfig = {
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: true
            },
            titleBarStyle: 'hiddenInset'
        }
        super({
            ...baseConfig,
            ...config
        });
        
        this.loadFile(filePath)

        this.once('ready-to-show', () => {
            this.show();
        })
    }
}

function createWindow () {
    mainWindow = new appWindow({
        width: 500,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            devTools: true
        }
    }, './renderer/index/index.html')

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    ipcMain.on('open-add-music-window', () => {
        console.log('open-add-music-window');
        if (!addMusicWindow) {
            createAddMusicWindow();
        }
    });
    
}

function createAddMusicWindow() {
    if (addMusicWindow) {
        return;
    }
    addMusicWindow = new appWindow({
        width: 500,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            devTools: true
        },
        parent: mainWindow
    }, './renderer/add/add.html')

    // addMusicWindow.webContents.openDevTools();

    addMusicWindow.on('closed', function () {
        addMusicWindow = null
    })
}
initIpc();

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

function initIpc() {
    ipcMain.on('open-file-dialog', (event) => {
        dialog.showOpenDialog({
            title: '选择音乐',
            filters: [
                { name: 'Music', extensions: ['mp3', 'wav', 'flac'] },
            ],
            properties: ['openFile', 'multiSelections'] 
        }, (files)  => {
            console.log('filePaths: ', files);
            if (files) {
                event.sender.send('selected-file', files);
            }
        })
    });
    
    ipcMain.on('add-music', (event, files) => {
        console.log('main - add-music');
        mainWindow.webContents.send('add-music', files);
    
        addMusicWindow.close();
    }); 
}

