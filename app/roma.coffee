window.Bandura = require('./api/Bandura')
window.playlists = require './fixtures/playlists'
window.bandura = new Bandura
  remote:
    host: 'ws://localhost:3000'
    actions:
      Previous: 'previousTrack'
      Next: 'nextTrack'
      Play: 'play'
      Pause: 'pause'
