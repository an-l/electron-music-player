const { ipcRenderer } = require('electron');
const Path = require('path')

const MUSIC_PLAY_BTN_DOM_CLASS = 'play-music-btn'
const MUSIC_DEL_BTN_DOM_CLASS = 'del-music-btn'
const MUSIC_ITEM_DOM_CLASS = 'music-item'

module.exports = class Player {
    constructor() {
        this.dom = {
            musicList: document.querySelector('#musicList'),
            musicPlayer: document.querySelector('#musicPlayer'),
            musicName: document.querySelector('#musicName'),
            musicNowTime: document.querySelector('#musicNowTime'),
            musicAllTime: document.querySelector('#musicAllTime'),
            musicPercent: document.querySelector('#musicPercent'),
            progress: document.querySelector('#progress'),
            progressWrap: document.querySelector('#progressWrap'),
            musicPlayerController: document.querySelector('#musicPlayerController'),
        }

        this.currentPlayMusicInfo = {
            index: 0,
            path: ""
        };
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
        this.renderMusicList(this.musicPathList);
        this.initEvent();
    }

    initEvent() {
        this.dom.musicList.addEventListener('click', (e) => {
            // 如果点击的播放按钮
            if(e.target.classList.contains(MUSIC_PLAY_BTN_DOM_CLASS)) {
                let parentNode = e.target.parentNode.parentNode;

                this.onClickPlayMusic(parentNode)
                return;
            }

            // 如果点击的删除按钮
            if(e.target.classList.contains(MUSIC_DEL_BTN_DOM_CLASS)) {
                let parentNode = e.target.parentNode.parentNode;

                this.onClickDelMusic(parentNode)
                return;
            }
        });

        this.dom.musicPlayer.addEventListener('loadedmetadata', (e) => {
            let target = e.target;
            this.dom.musicAllTime.innerHTML = this.transTime(target.duration);
        });

        this.dom.musicPlayer.addEventListener('timeupdate', (e) => {
            let target = e.target;
            let currentTime = target.currentTime;
            let duration = target.duration;
            
            // 如果当前不是暂停状态
            if(!e.target.paused) {
                this.renderMusicProgress(currentTime, duration)
            }

        })

        this.dom.musicPlayer.addEventListener('ended', this.onPlayMusicEnd.bind(this));

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

        this.dom.musicPlayerController.addEventListener('click', (e) => {
            // 如果点击的暂停按钮
            if(e.target.classList.contains('pause-btn')) {
                // 如果当前不是暂停状态
                if(!this.dom.musicPlayer.paused) {
                    let parentNode = e.target.parentNode;
                    e.target.classList.remove('active');
                    parentNode.querySelector('.play-btn').classList.add('active');

                    this.dom.musicPlayer.pause();
                }
                return;
            }

            // 如果点击的播放按钮
            if(e.target.classList.contains('play-btn')) {
                debugger;
                // 如果当前是暂停状态
                if(this.dom.musicPlayer.paused && this.currentPlayMusicInfo.path !== '') {
                    let parentNode = e.target.parentNode;
                    e.target.classList.remove('active');
                    parentNode.querySelector('.pause-btn').classList.add('active');

                    this.dom.musicPlayer.play();
                }
                return;
            }
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

    /**
     * 点击播放音乐
     * @param {Object} node dom节点
     */
    onClickPlayMusic(node) {
        this.dom.musicList.querySelectorAll(`.${MUSIC_ITEM_DOM_CLASS}`).forEach(dom => {
            dom && dom.classList.remove('active');
        })
        
        if(!node.classList.contains('active')) {
            node.classList.add('active');
        }

        this.dom.musicPlayerController.querySelector('.play-btn').classList.remove('active');
        this.dom.musicPlayerController.querySelector('.pause-btn').classList.add('active');

        const {path, index} = node.dataset;
        this.playMusic(path, index);
    }

    /**
     * 点击删除音乐
     * @param {Object} node dom节点
     */
    onClickDelMusic(node) {
        const {index} = node.dataset;
        this.delMusic(index);
    }
    /**
     * 播放音乐结束
     * @param {Object} e 事件对象
     */
    onPlayMusicEnd(e) {
        let {index} = this.currentPlayMusicInfo;

        if (index < this.musicPathList.length) {
            index++;

            let musicItems = document.querySelectorAll(`.${MUSIC_PLAY_BTN_DOM_CLASS}`);
            if(musicItems && musicItems[index]) {
                let parentNode = musicItems[index].parentNode.parentNode;

                this.onClickPlayMusic(parentNode)
            }
        }
    }

    renderMusicList(list) {
        let parseHtml = list.reduce(((html, path, index) => 
            html + 
            `<li class="music-item" data-path="${path}" data-index="${index}">
                <div class="music-item-name">${Path.basename(path)}</div>
                <div class="music-controller">
                    <i class="play-music-btn iconfont icon-play-circle"></i>
                    <i class="del-music-btn iconfont icon-delete"></i>
                </div>
            </li>`
        ), '')

        this.dom.musicList.innerHTML = parseHtml;
    }

    renderMusicProgress(currentTime = 0, duration = 0) {
        if(!duration || isNaN(duration)) {
            duration = 0;
        }

        this.dom.musicNowTime.innerHTML = this.transTime(currentTime);
        this.dom.musicAllTime.innerHTML = this.transTime(duration);
        let playingPercent = Math.floor(currentTime / duration * 100);


        if(!playingPercent || isNaN(playingPercent)) {
            playingPercent = 0;
        }
        this.dom.musicPercent.innerHTML = `${playingPercent}%`;
        this.dom.progress.style.width = `${playingPercent}%`;
    }

    playMusic(path, index) {
        this.currentPlayMusicInfo.path = path;
        this.currentPlayMusicInfo.index = index;
        this.dom.musicPlayer.src = path;
        this.dom.musicPlayer.play();

        this.dom.musicName.innerHTML = Path.basename(path);
    }

    delMusic(index) {
        // 如果当前删除歌曲正在播放中，停止播放
        if(index === this.currentPlayMusicInfo.index) {
            this.dom.musicPlayer.pause();
        }

        this.musicPathList.splice(index, 1);
       
        this.currentPlayMusicInfo.path = '';
        this.currentPlayMusicInfo.index = 0;

        this.dom.musicName.innerHTML = '';

        this.renderMusicList(this.musicPathList);
        this.renderMusicProgress();
    }

    transTime(time) {
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
}