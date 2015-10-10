
const order = [2, 1, 0];

export default function(instance) {
  return {
    // remote: {
    //   name: 'Remote',
    //   order: order[0],
    //   action: instance.startRemote.bind(instance),
    //   liClass: 'b-player--network',
    //   iconClass: 'b-icon__network',
    //   tooltip: 'Start remote control',
    // },
    stopRemote: {
      name: 'Stop remote',
      order: order[0],
      action(ws1, ws2) {
        ws1.close();
        ws2.close();
      },
      liClass: 'b-player--network',
      iconClass: 'b-icon__network',
      tooltip: 'Stop remote control',
    },
    youtube: {
      name: 'Youtube',
      order: order[1],
      action: instance.findYouTubeVideos.bind(instance),
      liClass: 'b-player--youtube',
      iconClass: 'b-icon__youtube',
      tooltip: 'Search video on youtube',
    },
    togglePlaylists: {
      order: order[2],
      name: 'Toggle playlists',
      action() {
        return instance.UI.player.setState({
          showPlaylists: !instance.UI.player.state.showPlaylists,
        });
      },
      liClass: 'b-player--show-pl',
      iconClass: 'b-icon__th-list',
      tooltip: 'open/close playlists',
    },
  };
}
