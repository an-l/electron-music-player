const { ipcRenderer } = require('electron');

class Add {
    constructor() {
        this.dom = {
            chooseMusicBtn: document.querySelector('#chooseMusicBtn'),
            test: document.querySelector('#test')
        }
        this.initEvent();
    }

    initEvent() {
        this.dom.chooseMusicBtn.addEventListener('click', () => {
            ipcRenderer.send('open-file-dialog')
        })

        ipcRenderer.on('selected-file', (event, files) => {
            console.log('selected-file: ');
            this.dom.test.innerHTML = files;
        })
    }
}

const add = new Add();