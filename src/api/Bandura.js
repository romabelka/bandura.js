
import { soundManager as SoundManager } from 'soundmanager2';
import _ from 'lodash';

import {
  controls, progress, collections, settingsChanges,
  videos, buttons, soundEvents, notify
} from '../dispatcher/api';

import render from '../dispatcher/render';

import PlayerSettings from './PlayerSettings';
import Buttons from './Buttons';
import Track from './Track';
import Playlist from './Playlist';
import PLCollection from './PLCollection';

const soundManagerEvents = [
  'load', 'play', 'pause', 'resume', 'stop', 'failure', 'finish',
];

function validVolume(vol) {
  if (!_.isNumber(vol)) {
    throw new Error('Volume must be a number');
  }

  if (vol < 0) {
    return 0;
  }

  if (vol > 100) {
    return 100;
  }

  return vol;
}

export default class Bandura {
  constructor(options) {
    this.volume = options.volume;
    this._remoteSettings = options.remote;

    settingsChanges.push(new PlayerSettings(this.volume, false));

    SoundManager.setup({
      url: 'http://localhost/required/swf/',
      debugFlash: false,
      debugMode: false,
      consoleOnly: true,
      flashLoadTimeout: 5000,
      flashVersion: 9,
      useHighPerformance: true,
      preferFlash: false,
      useHTML5Audio: true,
      useFlashBlock: true,
      html5PollingInterval: 1000,
      flashPollingInterval: 1000,
      defaultOptions: {
        volume: this.volume,
        whileplaying: ()=> progress.push(this),
        whileloading: ()=> progress.push(this),
      },
    });

    _.each(soundManagerEvents, (event) => {
      const soundOptions = {};

      soundOptions[`on${event}`] = ()=> soundEvents.push(event);

      SoundManager.setup({
        defaultOptions: soundOptions,
      });
    });

    const r = render();

    this.UI = r.UI;
    this.events = r.events;

    const db = Buttons(this);

    buttons.push({
      buttons: [db.remoteBtn, db.youtubeBtn, db.togglePlaylistsBtn],
    });

    if (options.buttons) {
      buttons.push({
        buttons: options.buttons,
      });
    }
  }

  setVolume(vol) {
    this.volume = validVolume(vol);
    settingsChanges.push({ volume: this.volume });
    return this;
  }

  mute() {
    settingsChanges.push({ mute: true });
    return this;
  }

  unmute() {
    settingsChanges.push({ mute: false });
    return this;
  }

  pause() {
    settingsChanges.push({ action: 'pause' });
    return this;
  }

  play() {
    settingsChanges.push({ action: 'play' });
    return this;
  }

  stop() {
    settingsChanges.push({ action: 'stop' });
    return this;
  }

  setPosition(percent) {
    controls.push({
      action: 'setPosition',
      percent: percent,
    });

    return this;
  }

  playTrack(obj) {
    if (_.isEmpty(obj)) {
      throw new Error('track cant be empty object');
    }

    const track = obj instanceof Track ? obj : new Track(obj);

    controls.push({ action: 'stop' });
    this.setCustomPlaylist([track]);
    controls.push({ action: 'play' });

    return this;
  }

  playPlaylist(pl) {
    controls.push({ action: 'stop' });

    if (!(pl instanceof Playlist)) {
      this.setCustomPlaylist.apply(this, arguments);
    } else {
      collections.push({
        action: 'updateActive',
        playlist: pl,
      });
    }

    controls.push({ action: 'play' });

    return this;
  }

  nextTrack() {
    controls.push({ action: 'nextTrack' });

    return this;
  }

  previousTrack() {
    controls.push({ action: 'previousTrack' });

    return this;
  }

  setCustomPlaylist(tracks, currentTrack = 0) {
    collections.push({
      action: 'updateActive',
      playlist: new Playlist(
        tracks, 'Custom playlist',
        currentTrack, PLCollection.CUSTOM_ID
      ),
    });
  }

  setActivePlaylist(pl) {
    controls.push({ action: 'stop' });

    collections.push({
      action: 'updateActive',
      playlist: pl,
    });

    return this;
  }

  setPlaylistsCollection(collection) {
    const coll = collection instanceof PLCollection ?
      new PLCollection(collection) : coll;

    collections.push({
      action: 'setNewCollection',
      collection: coll,
    });

    return this;
  }

  removePlaylist(pl) {
    collections.push({
      action: 'removePlaylist',
      playlist: pl,
    });

    return this;
  }

  addPlaylist(pl) {
    const p = Array.isArray(pl) ? new Playlist(pl, arguments[1]) : pl;

    collections.push({
      action: 'addPlaylist',
      playlist: p,
    });

    return this;
  }

  addTracksToActivePlaylist() {
    collections.push({
      action: 'addTracksToActivePlaylist',
      arguments: arguments,
    });
  }

  findYouTubeVideos(track) {
    if (!track) {
      throw new Error('Noting is playing right now');
    }

    this.UI.player.setState({ videoScreen: true });
    videos.push(
      `${track.artist} ${track.name}`
    );
  }

  addButtons(additionalButtons) {
    buttons.push({ buttons: additionalButtons });

    return this;
  }

  removeButtons(names) {
    buttons.push({
      remove: true,
      buttons: names,
    });
  }

  notify(text) {
    notify.push(text);
  }
}

Bandura.Track = Track;
Bandura.Playlist = Playlist;
Bandura.PLCollection = PLCollection;
Bandura.validVolume = validVolume;
