const { ipcRenderer } = require('electron');

class Index {
    constructor() {
        this.dom = {
            addMusicBtn: document.querySelector('#addMusicBtn')
        }
        this.initEvent();
    }

    initEvent() {
        this.dom.addMusicBtn.addEventListener('click', (e) => {
            ipcRenderer.send('open-add-music-window');
        })
    }
    
}

let index = new Index();
