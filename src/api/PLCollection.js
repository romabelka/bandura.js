
import _ from 'lodash';
import Utils from '../utils';
import Playlist from './Playlist';

const CUSTOM_ID = 0;
const FAVORITE_ID = 1;

export default class PLCollection {

  constructor(playlists, activeId = 0) {
    this._plIds = _.pluck(playlists, 'id');
    this._activeId = activeId;
    this._playlists = playlists ? playlists : [
      new Playlist([], 'Custom playlist', 0, CUSTOM_ID),
      new Playlist([], 'Favourite', 0, FAVORITE_ID),
    ];
  }

  addPlaylist(playlist, position = null) {
    if (_.contains(this._plIds, playlist.getId())) {
      throw new Error('Collection allready contains this playlist');
    }

    return new PLCollection(
      Utils.insertOn(
        this._playlists, playlist,
        position || this._playlists.length
      ), this._activeId
    );
  }

  removePlaylist(playlist) {
    const pos = this._playlists.indexOf(playlist);
    const activeId = this._activeId !== playlist.getId()
      ? this._activeId : null;

    return new PLCollection(
      Utils.removeFrom(this._playlists, pos),
      activeId
    );
  }

  update(playlist) {
    const current = this.getPlaylistById(playlist.getId());

    if (!current) {
      return this.addPlaylist(playlist);
    }

    return new PLCollection(
      Utils.updateOn(
        this._playlists, this._playlists.indexOf(current), playlist
      ), this._activeId
    );
  }

  removeTrack(playlist, track) {
    return this.update(playlist.removeTrack(track));
  }

  updateActive(playlist) {
    const current = this.update(playlist);

    return this._activeId === playlist.getId() ?
      current : current.setActivePlaylist(playlist);
  }

  setActivePlaylist(playlist) {
    return new PLCollection(this._playlists, playlist.getId());
  }

  addTracksToActivePlaylist(tracks, index) {
    if (!this.getActivePlaylist()) {
      throw new Error('no Active playlist');
    }

    return this.updateActive(this.getActivePlaylist().addTracks(_.flatten(tracks), index));
  }

  getPlaylistById(id) {
    return _.find(this._playlists, (pl) => pl.getId() === id);
  }

  getAllPlaylists() {
    return this._playlists;
  }

  getActivePlaylist() {
    return this.getPlaylistById(this._activeId);
  }

  getCustomPlaylist() {
    return this.getPlaylistById(CUSTOM_ID);
  }

  getFavoritePlaylist() {
    return this.getPlaylistById(FAVORITE_ID);
  }

  getActiveTrack() {
    const activePl = this.getActivePlaylist();

    if (!activePl) {
      return null;
    }

    return activePl.getActiveTrack();
  }

  getActiveTrackId() {
    const activeTrack = this.getActiveTrack();

    if (!activeTrack) {
      return null;
    }

    return activeTrack.id;
  }
}
