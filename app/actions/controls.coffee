Actions = require('./../core/actions')

module.exports = new Actions('controls',
  play: ->
    console.log '------------------------------------ changes next'
    store.update({playing: {
      track_id: "rrmusic:track:120" + _([4..9]).shuffle()[0]
    }})

    console.log('ACTION::PLAY', arguments)
  pause: ->
    console.log('ACTION::PAUSE', arguments)
  mute: ->
    console.log('ACTION::MUTE', arguments)
  setVolume: ->
    console.log('ACTION::SETVOLUME', arguments)
)