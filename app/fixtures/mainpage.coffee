tracks = require './tracks'
playlists = require './playlists'
Track = require '../api/track'
$(->
  for track in tracks
    el = $('<td>').text(track.name).appendTo('.js-tracks')
    el.click ((tr)-> -> bandura.playTrack(tr))(track)
    el.on 'dragstart', ((tr) -> (ev)-> ev.originalEvent.dataTransfer.setData 'track', JSON.stringify tr)(track)

  for playlist in playlists
    el = $('<td>').text(playlist.getName()).appendTo('.js-playlists')
    el.click ((pl)-> -> bandura.playPlaylist(pl))(playlist)
    el2 = $('<td>').html('<button title="' + playlist.getName() + '">add playlist</button> ').appendTo('.js-playlists-add')
    el2.click ((pl)-> -> bandura.addPlaylist(pl._tracks, pl._name))(playlist)

  $('td').attr('draggable', true)

  $('#testing').on('drop', (ev) ->
    ev.preventDefault()
    track = new Track JSON.parse(ev.originalEvent.dataTransfer.getData 'track')
    console.log '----', track
  ).on 'dragover', (ev) ->
    ev.preventDefault()
    console.log '----', 1111
)