const { ipcRenderer } = require('electron');
const Player = require('./player');

class Index{
    constructor() {
        this.dom = {
            addMusicBtn: document.querySelector('#addMusicBtn')
        }
        this.initEvent();

        this.player = new Player();
    }

    initEvent() {
        this.dom.addMusicBtn.addEventListener('click', (e) => {
            ipcRenderer.send('open-add-music-window');
        })
    }
}

let index = new Index();

