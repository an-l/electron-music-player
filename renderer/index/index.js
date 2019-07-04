const { ipcRenderer } = require('electron');
const Path = require('path')

class Index {
    constructor() {
        this.dom = {
            addMusicBtn: document.querySelector('#addMusicBtn'),
            musicList: document.querySelector('#musicList'),
            musicPlayer: document.querySelector('#musicPlayer'),
            musicName: document.querySelector('#musicName'),
            musicNowTime: document.querySelector('#musicNowTime'),
            musicAllTime: document.querySelector('#musicAllTime'),
            musicPercent: document.querySelector('#musicPercent'),
            progress: document.querySelector('#progress'),
            progressWrap: document.querySelector('#progressWrap'),
        }
        this.currentPlayMusicPath = "";
        this.musicPathList = [
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
            '/Users/li/Documents/音乐/rockstar (feat. 21 Savage).mp3',
        ];
        this.initEvent();

        this.renderMusicList(this.musicPathList);
    }

    initEvent() {
        this.dom.addMusicBtn.addEventListener('click', (e) => {
            ipcRenderer.send('open-add-music-window');
        })

        this.dom.musicList.addEventListener('click', (e) => {
            let musicItemClass = 'play-music-btn'
            if(e.target.classList.contains(musicItemClass)) {
                let parentNode = e.target.parentNode.parentNode;
                let musicPath = parentNode.dataset.path;
                if(!parentNode.classList.contains('active')) {
                    parentNode.classList.add('active');
                }
                this.playMusic(musicPath);
            }
        });

        this.dom.musicPlayer.addEventListener('loadedmetadata', (e) => {
            let target = e.target;
            this.dom.musicAllTime.innerHTML = transTime(target.duration);
        });

        this.dom.musicPlayer.addEventListener('timeupdate', (e) => {
            let target = e.target;
            let currentTime = target.currentTime;
            let duration = target.duration;

            if(!duration || isNaN(duration)) {
                duration = 0;
            }

            this.dom.musicNowTime.innerHTML = transTime(currentTime);
            let playingPercent = Math.floor(currentTime / duration * 100);
            this.renderMusicProgress(playingPercent)
        })

        this.dom.progressWrap.addEventListener('click', (e) => {
            let musicPlayerDom = this.dom.musicPlayer;
            musicPlayerDom.pause();
            if(!musicPlayerDom.src || !musicPlayerDom.duration) {
                return;
            }
            let parentNode = e.target.parentNode;
            let parentWidht = parentNode.offsetWidth;
            let rate = e.offsetX / parentWidht;

            musicPlayerDom.currentTime = musicPlayerDom.duration * rate;
            musicPlayerDom.play();
        })

        ipcRenderer.on('add-music', (event, files) => {
            console.log('index - add-music', files);
            this.musicPathList = [
                ...this.musicPathList,
                ...files
            ];

            this.renderMusicList(this.musicPathList)
        })
    }


    renderMusicList(list) {
        let parseHtml = list.reduce(((html, path) => 
            html + 
            `<li class="music-item" data-path="${path}">
                <div class="music-item-name">${Path.basename(path)}</div>
                <div class="music-controller">
                    <i class="play-music-btn iconfont icon-play-circle"></i>
                    <i class="del-music-btn iconfont icon-delete"></i>
                </div>
            </li>`
        ), '')

        this.dom.musicList.innerHTML = parseHtml;
    }

    renderMusicProgress(percent) {
        if(!percent || isNaN(percent)) {
            percent = 0;
        }
        this.dom.musicPercent.innerHTML = `${percent}%`;
        this.dom.progress.style.width = `${percent}%`;
    }

    playMusic(path) {
        this.currentPlayMusicPath = path;
        this.dom.musicPlayer.src = path;
        this.dom.musicPlayer.play();

        this.dom.musicName.innerHTML = Path.basename(path);
    }
    
}

let index = new Index();


function transTime(time) {
    if(!time) {
        return '00:00';
    }
    var duration = parseInt(time);
    var minute = parseInt(duration/60);
    var sec = duration%60+'';
    var isM0 = ':';
    if(minute == 0){
        minute = '00';
    }else if(minute < 10 ){
        minute = '0'+minute;
    }
    if(sec.length == 1){
        sec = '0'+sec;
    }
    return minute+isM0+sec
}