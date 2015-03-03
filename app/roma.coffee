window.Bandura = require('./api/Bandura')

window.bandura = new Bandura
  remote:
    host: 'ws://localhost:3000'
    actions:
      Previous: 'previousTrack'
      Next: 'nextTrack'
      Play: 'play'
      Pause: 'pause'

#====fixtures===
window.playlists = require './fixtures/playlists'
window.tracks = require './fixtures/tracks'
require './fixtures/mainpage'