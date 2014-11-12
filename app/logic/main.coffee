class @Track
  defaults: {
    artist: 'unknown artist'
    name: 'unknown track'
  }

  constructor: (data) ->
    _.extend(@, @defaults, data)

class @Player

  # Public

  constructor: (options) ->
    _.extend(@, {
      volume: 80
    },options)

    soundManager.setup
      url: "http://localhost/required/swf/"
      debugFlash: false
      debugMode: false
      consoleOnly: true
      flashLoadTimeout: 5000
      flashVersion: 9
      useHighPerformance: true
      preferFlash: false
      useHTML5Audio: true
      useFlashBlock: true


  setVolume: (vol) -> @volume = vol
  getVolume: -> @volume

  # [Track] or [create track] -> nothing
  play: (obj) ->
    track =
      if obj instanceof Track then obj
      else if _.isEmpty obj then currentTrack
      else new Track obj

    playBus.push({track: track, action: 'play'})
    soundManager.createSound(track)
    soundManager.play(track.id)


  # Protected(API for frontend and soundmanager)

  # Private
  currentTrack = {}

  # realization
  playBus = new Bacon.Bus()





@sPlayer = new Player()

@track = new Track
  id: '1204'
  url: 'https://storage.tunehog.com/public/rrmusic/track/1204.mp3'

