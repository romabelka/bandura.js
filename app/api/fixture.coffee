@sPlayer = new Player()

@track1 = new Track
  id: '1204'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1204.mp3'

@track2 = new Track
  id: '1205'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1205.mp3'


@track3 = new Track
  id: '1206'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1206.mp3'

@track4 = new Track
  id: '1207'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1207.mp3'


@playlist1 = new Playlist([track1,track2,track4],'Fixture playlist')
