
import Track from './Track';
import Utils from '../utils';

export default class Playlist {
  constructor(tracks = [], name = 'User playlist', id, activeTrackIndex) {
    this._id = id ? id : Utils.randomId();
    this._name = name;
    this._activeTrackIndex = activeTrackIndex || 0;

    this._tracks = tracks.map((track) => {
      return track instanceof Track ? track : new Track(track);
    });
  }

  get(prop) {
    return this[prop];
  }

  getId() {
    return this.get('_id');
  }

  getName() {
    return this.get('_name');
  }

  getTracks() {
    return this.get('_tracks');
  }

  getActiveTrack() {
    return this.get('_tracks')[this.get('_activeTrackIndex')];
  }

  getActiveTrackIndex() {
    return this.get('_activeTrackIndex');
  }

  hasNext() {
    return (this.getActiveTrackIndex() || 0) < this._tracks.length - 1;
  }

  hasPrevious() {
    return this.getActiveTrackIndex() > 0;
  }

  changeTrack(trackIndex) {
    if (trackIndex === this.getActiveTrackIndex()) {
      return this;
    }

    return new Playlist(this._tracks, this._name, this._id, trackIndex);
  }

  nextTrack() {
    if (this._activeTrackIndex >= this._tracks.length - 1) {
      throw new Error('no next track');
    }

    return this.changeTrack(this.getActiveTrackIndex + 1);
  }

  previousTrack() {
    if (this.getActiveTrackIndex() <= 0) {
      throw new Error('no previous track');
    }

    return this.changeTrack(this.getActiveTrackIndex() - 1);
  }

  addTracks(tracks, position) {
    let activeTrack;

    if (this.getActiveTrackIndex()) {
      if (position) {
        activeTrack = position > this.getActiveTrackIndex() ?
          this.getActiveTrackIndex() : this.getActiveTrackIndex() +
          this.getTracks().length;
      } else {
        activeTrack = this.getActiveTrackIndex();
      }
    }


    return new Playlist(
      Utils.insertOn(this.getTracks(), tracks, position),
      this.getName(), this.getId(), activeTrack
    );
  }

  addTrack(track, position) {
    return this.addTracks([track], position);
  }

  removeTrack(track) {
    const position = this.getTracks().indexOf(track);
    const tracks = Utils.removeFrom(this.getTracks(), position);
    let activeTrackIndex;

    if (position < this.getActiveTrackIndex()) {
      activeTrackIndex = this.getActiveTrackIndex();
    }

    if (position > this.getActiveTrackIndex()) {
      activeTrackIndex = this.getActiveTrackIndex() - 1;
    }

    return new Playlist(tracks, this.getName(), this.getId(), activeTrackIndex);
  }
}
