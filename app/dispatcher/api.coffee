dispatcherAPI =
  controls        : new Bacon.Bus()
  progress        : new Bacon.Bus()
  activePlaylist  : new Bacon.Bus()
  collections     : new Bacon.Bus()
  settingsChanges : new Bacon.Bus()
  videos          : new Bacon.Bus()
  buttons          : new Bacon.Bus()

module.exports = dispatcherAPI
