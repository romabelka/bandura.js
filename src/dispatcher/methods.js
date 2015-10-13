
import { soundManager as SoundManager } from 'soundmanager2';
import Utils from '../utils';

import { controls, collections } from './api';

export default function(playlist, task) {
  function stop() {
    if (!playlist) {
      return playlist;
    }

    const activeTrack = playlist.getActiveTrack();

    if (!activeTrack) {
      return playlist;
    }

    SoundManager.stop(activeTrack.id);

    return Utils.extendImmutable(playlist, { playingStatus: 'Stoped' });
  }

  function play() {
    const activeTrack = playlist.getActiveTrack();

    SoundManager.pauseAll();

    if (activeTrack) {
      SoundManager.createSound(activeTrack);
      SoundManager.play(activeTrack.id);
    }

    return Utils.extendImmutable(playlist, { playingStatus: 'isPlaying' });
  }

  function pause() {
    SoundManager.pauseAll();

    return Utils.extendImmutable(playlist, { playingStatus: 'Paused' });
  }

  function nextTrack() {
    const next = playlist.nextTrack();

    stop();

    collections.push({
      action: 'update',
      playlist: next,
    });

    controls.push({
      action: 'play',
    });

    return Utils.extendImmutable(
      playlist, { playingStatus: 'switched to next track' }
    );
  }

  function previousTrack() {
    const previous = playlist.previousTrack();

    stop();

    collections.push({
      action: 'update',
      playlist: previous,
    });

    controls.push({
      action: 'play',
    });

    return Utils.extendImmutable(
      playlist, { playingStatus: 'switched to previous track' }
    );
  }

  function setPosition() {
    const track = SoundManager.getSoundById(playlist.getActiveTrack().id);

    return track.setPosition(
      track.duration * task.percent
    );
  }

  return {
    stop,
    play,
    pause,
    nextTrack,
    previousTrack,
    setPosition,
  };
}
