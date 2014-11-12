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

  setVolume: (vol) -> @volume = vol
  getVolume: -> @volume

  # [Track] or [create track] -> nothing
  play: (obj) ->
    track =
      if obj instanceof Track then obj
      else if _.isEmpty obj then currentTrack
      else new Track obj

  # Protected(API for frontend and soundmanager)

  

  # Private
  currentTrack = {}

  # realization







sPlayer = new Player()