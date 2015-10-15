
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

  try {
    return coll[ev.action].apply(
      coll, ev.playlist ? [ev.playlist] : ev.arguments
    );
  } catch (e) {
    notify.push(e.message);
    throw e;
  }
});

export const progressbar = playlistsCollection.sampledBy(progress, (coll) => {
  return {
    isActive: !!SoundManager.getSoundById(coll.getActiveTrackId()),
    smTrack: SoundManager.getSoundById(coll.getActiveTrackId()),
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
    collection ? collection.getActiveTrackId() : null,
    settings.volume
  );
});

export const playerActions = playlistsCollection.sampledBy(
  controls, (collection, task) => {
    const playlist = collection.getActivePlaylist();

    try {
      return controlsMethods(playlist, task)[task.action]();
    } catch (e) {
      return new Bacon.Error(e);
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

  return btns.concat(ev.buttons);
}).combine(playlistsCollection, (btns, collection) => {
  return btns.map((btn) => {
    return Utils.extendImmutable(btn, {
      callback: () => {
        btn.action(
          collection.getActiveTrack(),
          collection
        );
      },
    });
  }).sort((a, b) => a.order > b.order );
});

export const videoSet = videos.flatMapLatest((query) => {
  const url = `https://www.googleapis.com/youtube/v3/search?&part=snippet&q=${query}&type=video&videoCategoryId=19&key=AIzaSyAtH93CIUo3NvA2nvL3ltsYtl319P1vsNo`;

  return Bacon.fromPromise($.ajax({
    url: url,
    dataType: 'json',
  }));
}).flatMap((response) => {
  if (!response.error && response.items) {
    return response.items;
  }

  return new Bacon.Error(new Error('Nothing found'));
});

const errors = playerActions.errors()
  .merge(videoSet.errors())
  .flatMapError((err) => {
    return err.message;
  });

export const notifications = notify.merge(errors).map((text) => {
  return {
    text,
    timestamp: Date.now(),
  };
}).slidingWindow(10);

export { soundEvents };
