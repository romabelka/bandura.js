buttonsOrder =
  remote: 3
  youtube: 2
  playlists: 1

module.exports = (instance) ->
  remoteBtn :
    name: 'Remote'
    order: buttonsOrder.remote
    action: (->instance.startRemote()).bind instance
    liClass: 'b-player--network'
    iconClass: 'b-icon__network'
    tooltip: 'Start remote control'
  stopRemoteBtn : (ws)->
    name: 'Stop remote'
    order: buttonsOrder.remote
    action: ->ws.close()
    liClass: 'b-player--network'
    iconClass: 'b-icon__network'
    tooltip: 'Stop remote control'
  youtubeBtn :
    name: 'Youtube'
    order: buttonsOrder.youtube
    action: instance.findYouTubeVideos.bind instance
    liClass: 'b-player--youtube'
    iconClass: 'b-icon__youtube'
    tooltip: 'Search video on youtube'
  togglePlaylistsBtn :
    order: buttonsOrder.playlists
    name: 'Toggle playlists'
    action: (-> instance.UI.player.setState showPlaylists: not instance.UI.player.state.showPlaylists).bind instance
    liClass: 'b-player--show-pl'
    iconClass: 'b-icon__th-list'
    tooltip: 'open/close playlists'