import { getUid } from './uid';
import HttpSong from '../api/song';

let urlMap = {};

class Song {
    constructor(id, mid, singer, name, album, duration, image) {
        this.id = id;
        this.mid = mid;
        this.singer = singer;
        this.name = name;
        this.album = album;
        this.duration = duration;
        this.image = image;
        this.filename = `C400${this.mid}.m4a`;
        this.HttpSong = new HttpSong();
        if (urlMap[this.id]) {
            this.url = urlMap[this.id];
        } else {
            this._getUrl();
        }
    }

    async _getUrl() {
        if (this.url) {
            return;
        }
        var data = await this.HttpSong.getVKey(this.mid, this.filename);
        if (this.code === 0) {
            const vkey = data.data.items[0].vkey;
            this.url = `http://dl.stream.qqmusic.qq.com/${this.filename}?vkey=${vkey}&guid=${getUid()}&uin=0&fromtag=66`
            urlMap[this.id] = this.url;
        }
    }
}

export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    });
}

function filterSinger(singer) {
    let ret = [];
    if (!singer) {
        return '';
    }
    singer.forEach((s) => {
        ret.push(s.name);
    });
    return ret.join('/');
}

export function isValidMusic(musicData) {
    return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0);
}

