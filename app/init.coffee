try
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