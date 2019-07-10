const Store = require('electron-store');
const Path = require('path');
const uuidv4 = require('uuid/v4')

class DataStore extends Store {
    constructor(option) {
        super(option)

        this.tracks = this.getTrack();
    }

    clearTrack() {
        this.saveTrack([]);
    }
    delTrack(id) {
        this.tracks = this.tracks.filter(item => item.id !== id);

        this.saveTrack(this.tracks);
    }

    saveTrack(tracks) {
        this.set('tracks', tracks);
    }
    getTrack() {
        return this.get('tracks') || [];
    }

    addTrack(pathList = []) {
        let musicList = pathList.map(path => ({
            id: uuidv4(),
            path: path,
            name: Path.basename(path)
        })).filter(item => {
            let list = this.tracks.map(item => item.path);
            return list.indexOf(item.path) === -1
        })

        this.tracks = [
            ...this.tracks,
            ...musicList
        ]
        this.saveTrack(this.tracks);
    }
}

module.exports = new DataStore();