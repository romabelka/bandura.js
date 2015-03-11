window.Bandura = require('./api/Bandura')

window.bandura = new Bandura
  remote:
    host: 'ws://localhost:3000'
    actions:
      Previous: 'previousTrack'
      Next: 'nextTrack'
      Play: 'play'
      Pause: 'pause'
  buttons: [
    name: 'Custom'
    order: 4
    action: (track)-> alert(track?.name)
    liClass: 'b-player--network'
    iconClass: 'b-icon__network'
    tooltip: 'Some custom button'
  ]

#====fixtures===
window.playlists = require './fixtures/playlists'
window.tracks = require './fixtures/tracks'
require './fixtures/mainpage'
