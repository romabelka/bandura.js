@bandura = new Player()
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

@track5 = new Track
  id: '1208'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1208.mp3'

@track6 = new Track
  id: '1209'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1209.mp3'


@playlist1 = new Playlist([track1,track2,track3],'Fixture playlist')
@playlist2 = new Playlist([track4,track5], 'Second playlist')
@playlist3 = new Playlist([track6], 'Third playlist')