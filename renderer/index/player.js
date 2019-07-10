const { ipcRenderer } = require('electron');
const Path = require('path')
const Store = require('../../store/index.js')

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
            id: 0,
            path: ""
        };
        this.musicPathList = Store.getTrack() || [];
        this.renderMusicList(this.musicPathList)
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
                let {id} = parentNode.dataset;

                this.delMusic(id);
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

        ipcRenderer.on('add-music', (event) => {
            this.musicPathList = Store.getTrack();

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

        const {path, id} = node.dataset;
        this.playMusic(path, id);
    }

    /**
     * 播放音乐结束
     * @param {Object} e 事件对象
     */
    onPlayMusicEnd(e) {
        let {id} = this.currentPlayMusicInfo;

        let index = this.musicPathList.map(item => item.id).indexOf(id);
        index = index !== -1 ? index : 0;

        if (index < this.musicPathList.length) {
            index++;

            let musicItems = document.querySelectorAll(`.${MUSIC_PLAY_BTN_DOM_CLASS}`);
            if(musicItems && musicItems[index]) {
                let parentNode = musicItems[index].parentNode.parentNode;

                this.onClickPlayMusic(parentNode)
            }
        }
    }

    renderMusicList(list = this.musicPathList) {
        if(!list || !Array.isArray(list)) {
            return;
        }
        let parseHtml = list.reduce(((html, item) => 
            html + 
            `<li class="music-item" data-path="${item.path}" data-id="${item.id}">
                <div class="music-item-name">${item.name}</div>
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

    playMusic(path, id) {
        this.currentPlayMusicInfo.path = path;
        this.currentPlayMusicInfo.id = id;
        this.dom.musicPlayer.src = path;
        this.dom.musicPlayer.play();

        this.dom.musicName.innerHTML = Path.basename(path);
    }

    delMusic(id) {
        // 如果当前删除歌曲正在播放中，停止播放
        if(id === this.currentPlayMusicInfo.id) {
            this.dom.musicPlayer.pause();
        }

        this.musicPathList = this.musicPathList.filter(item => item.id !== id);
        Store.delTrack(id);
       
        this.currentPlayMusicInfo.path = '';
        this.currentPlayMusicInfo.id = 0;

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