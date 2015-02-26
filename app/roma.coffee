Bandura = require('./api/Bandura')
Track = require('./api/Track')
Playlist = require('./api/Playlist')

window.bandura = new Bandura()
window.track1 = new Track
  id: '1204'
  name: 'These Days'
  artist: 'Justin Bieber'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1204.mp3'

window.track2 = new Track
  id: '1205'
  name: 'AJust Me Up'
  artist: 'Kurt Kobein'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1205.mp3'


window.track3 = new Track
  id: '1206'
  name: 'ABla-bla-bla'
  genre: 'jazz'
  artist: 'Elvis Prestley'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1206.mp3'

window.track4 = new Track
  id: '1207'
  name: "These Days 2"
  genre: 'funk'
  artist: 'Justin Bieber'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1207.mp3'

window.track5 = new Track
  id: '1208'
  name: 'AJust Me Up 2'
  genre: 'rap'
  artist: 'Kurt Kobein'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1208.mp3'

window.track6 = new Track
  id: '1209'
  name: 'ABla-bla-bla 2'
  genre: 'horror'
  artist: 'Elvis Prestley'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1209.mp3'


window.playlist1 = new Playlist([track1,track2,track3],'Fixture playlist')
window.playlist2 = new Playlist([track4,track5], 'Second playlist')
window.playlist3 = new Playlist([track6], 'Third playlist')