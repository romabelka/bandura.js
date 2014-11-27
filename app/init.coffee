try
  window.controlActions = new Actions 'Controls ',
    play: ->
      console.log('ACTION::PLAY', arguments)
    pause: ->
      console.log('ACTION::PAUSE', arguments)
    mute: ->
      console.log('ACTION::MUTE', arguments)
    setVolume: ->
      console.log('ACTION::SETVOLUME', arguments)


  document.addEventListener "DOMContentLoaded", (event) ->
    console.log 'DOMContentLoaded'

    React.renderComponent(`<Bandura store={store} />`,
      document.getElementById('bandura-container')
    )

    setTimeout(->
      console.log '------------------------------------ changes next'
      store.update({playing: {
        track_id: "rrmusic:track:120" + _([4..9]).shuffle()[0]
      }})
    , 1500)
catch e
  console.error('ERROR: ', e)