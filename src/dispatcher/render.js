
import renderUi from '../ui/ui';

import {
  progressbar, playerSettings, playlistsCollection, playerActions,
  videoSet, callbacks, soundEvents, notifications
} from './main';

export default function render() {
  const UI = renderUi();

  playlistsCollection.onValue((PLC) => {
    UI.player.setProps({
      PLCollection: PLC,
    });

    UI.progressbar.setProps({
      currentTrack: PLC ? PLC.getActiveTrack() : null,
    });
  });

  progressbar.onValue((pb) =>
    UI.progressbar.setProps({
      position: pb.position,
      duration: pb.duration,
      loaded: pb.loaded,
    })
  );

  playerSettings.onValue((settings) => {
    UI.volume.setProps(settings);
  });


  playerActions.onValue((obj = {}) => {
    if (obj.playingStatus) {
      return UI.player.setProps({ playingStatus: obj.playingStatus });
    }
  });


  videoSet.onValue((videos) =>
    UI.player.setProps({ videos: videos })
  );

  callbacks.onValue((buttons) => UI.player.setProps({ buttons }));

  notifications.onValue(
    (lastN) => UI.player.setProps({ notifications: lastN })
  );

  return {
    UI: UI,
    events: soundEvents.combine(playlistsCollection, (se, plc) => {
      return {
        collection: plc,
        event: se,
      };
    }),
  };
}
