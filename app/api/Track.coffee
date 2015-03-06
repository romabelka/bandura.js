class Track
  defaults: {
    artist: 'unknown artist'
    name: 'unknown track'
  }

  constructor: (data) ->
    _.extend(@, @defaults, data)

  get: (param) -> @[param]

module.exports = Track