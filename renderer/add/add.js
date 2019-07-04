const { ipcRenderer } = require('electron');
const Path = require('path')

class Add {
    constructor() {
        this.dom = {
            chooseMusicBtn: document.querySelector('#chooseMusicBtn'),
            musicList: document.querySelector('#musicList'),
            addMusicBtn: document.querySelector('#addMusicBtn')
        }
        this.initEvent();

        this.musicPathList = [];
    }

    initEvent() {
        this.dom.chooseMusicBtn.addEventListener('click', () => {
            ipcRenderer.send('open-file-dialog')
        })
        this.dom.addMusicBtn.addEventListener('click', () => {
            ipcRenderer.send('add-music', this.musicPathList)
        })

        ipcRenderer.on('selected-file', (event, files) => {
            console.log('selected-file: ', files);
            this.musicPathList = [...files];
            this.renderMusicList(this.musicPathList);
        })
    }

    renderMusicList(list) {
        let parseHtml = list.reduce(((html, path) => 
            html + 
            `<li class="music-item" data-path="${path}">
                <div class="music-item-name">${Path.basename(path)}</div>
                <div class="music-controller">
                    <i class="del-music-btn iconfont icon-delete"></i>
                </div>
            </li>`
        ), '')

        this.dom.musicList.innerHTML = parseHtml;
    }
}

const add = new Add();