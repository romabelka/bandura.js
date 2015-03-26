utils = require '../utils/utils'

class Track
  defaults: {
    artist: 'unknown artist'
    name: 'unknown track'
  }

  constructor: (data) ->
    utils.extend(@, @defaults, data)

  get: (param) -> @[param]

module.exports = Track