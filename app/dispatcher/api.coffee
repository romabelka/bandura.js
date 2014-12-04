###
window.controls = new Bacon.Bus()
window.progress = new Bacon.Bus()
window.activePlaylist = new Bacon.Bus()
window.collections = new Bacon.Bus()
window.settingsChanges = new Bacon.Bus()
###

dispatcherAPI =
  controls        : new Bacon.Bus()
  progress        : new Bacon.Bus()
  activePlaylist  : new Bacon.Bus()
  collections     : new Bacon.Bus()
  settingsChanges : new Bacon.Bus()

module.exports = dispatcherAPI
