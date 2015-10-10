
import { soundManager as SoundManager } from 'soundmanager2';
import Bacon from 'baconjs';
import _ from 'lodash';
import $ from 'jquery';

import Bandura from '../api/Bandura';

import {
  controls, progress, collections, settingsChanges,
  videos, buttons, soundEvents, notify
} from './api';

import PLC from '../api/PLCollection';

import controlsMethods from './methods';

import Utils from '../utils';

function needStop(coll, ev) {
  const activePlaylist = coll.getActivePlaylist();
  if (ev.action === 'removeTrack') {
    const pl = ev.arguments[0];
    const tr = ev.arguments[1];

    return pl === activePlaylist && pl.getActiveTrack() === tr;
  }

  return ev.action === 'removePlaylist' && ev.playlist === activePlaylist;
}

export const playerSettings = settingsChanges.scan({}, (settings, changes) => {
  SoundManager[ changes.mute ? 'mute' : 'unmute' ]();

  if (changes.volume) {
    changes.volume = Bandura.validVolume(changes.volume);
    changes.mute = false;
    SoundManager.setup({
      defaultOptions: { volume: changes.volume },
    });
  }

  return Utils.extendImmutable(settings, changes);
});


export const playlistsCollection = collections.scan(new PLC(), (coll, ev) => {
  if (ev.action === 'setNewCollection') {
    return ev.collection;
  }

  if (needStop(coll, ev)) {
    controls.push({ action: 'stop' });
  }

  return coll[ev.action].apply(
    coll, ev.playlist ? [ev.playlist] : ev.arguments
  );
});

export const progressbar = playlistsCollection.sampledBy(
  progress, (coll, smTrack) => {
    return {
      isActive: coll.getActiveTrackId() === smTrack.id,
      smTrack,
    };
  }).filter(({ isActive }) => isActive).map(({ smTrack }) => {
    return {
      position: smTrack.position,
      duration: smTrack.duration,
      loaded: smTrack.bytesLoaded / smTrack.bytesTotal,
    };
  });

playerSettings.changes().combine(playlistsCollection, (a, b) => {
  return {
    settings: a,
    collection: b,
  };
}).onValue((obj) => {
  const settings = obj.settings;
  const collection = obj.collection;

  SoundManager.setVolume(
    collection.getActiveTrackId(),
    settings.volume
  );
});

export const playerActions = playlistsCollection.sampledBy(
  controls, (collection, task) => {
    const playlist = collection.getActivePlaylist();

    try {
      return controlsMethods(playlist, task)[task.action]();
    } catch (e) {
      new Bacon.Error(e);
    }
  }
).flatMap((e) => e).skipDuplicates();


soundEvents.onValue((ev) => {
  if (ev === 'finish') {
    controls.push({
      action: 'nextTrack',
    });
  }
});

export const callbacks = buttons.scan([], (btns, ev) => {
  if (ev.remove) {
    return btns.filter((btn) => !_.contains(ev.buttons, btn.name));
  }

  return buttons.concat(ev.buttons);
}).combine(playlistsCollection, (btns, collection) => {
  return btns.map((btn) => {
    Utils.extend(btn, {
      callback: () => {
        btn.action(
          collection.getActiveTrack(),
          collection
        );
      },
    });
  });

  // .sort((a, b) => a.order > b.order );
});

export const videoSet = videos.flatMapLatest((query) => {
  const protocol = window.location.protocol || 'http:';
  const url = protocol + `//gdata.youtube.com/feeds/api/videos/-/Music?q=${query}&hd=true&v=2&alt=jsonc&safeSearch=strict`;

  return Bacon.fromPromise($.ajax({
    url: url,
    dataType: 'jsonp',
  }));
}).flatMap((response) => {
  if (!response.error && response.data.items) {
    return response.data.items;
  }

  return new Bacon.Error(new Error('Nothing found'));
});

const errors = playerActions.errors()
  .merge(videoSet.errors())
  .flatMapError((err) => err.message);

export const notifications = notify.merge(errors).map((text) => {
  return {
    text: text,
    timestamp: Date.now(),
  };
}).slidingWindow(10);

export { soundEvents };
