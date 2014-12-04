Actions = require('./../core/actions')

module.exports = new Actions 'controls',
  play: ->
    console.log('ACTION::PLAY', arguments)
  pause: ->
    console.log('ACTION::PAUSE', arguments)
  mute: ->
    console.log('ACTION::MUTE', arguments)
  setVolume: ->
    console.log('ACTION::SETVOLUME', arguments)