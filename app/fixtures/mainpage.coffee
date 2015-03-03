tracks = require './tracks'
playlists = require './playlists'
$(->
  for track in tracks
    $('<td>').text(track.name).appendTo('.js-tracks').click ((tr)-> -> bandura.playTrack(tr))(track)
  for playlist in playlists
    $('<td>').text(playlist.getName()).appendTo('.js-playlists').click ((pl)-> -> bandura.playPlaylist(pl))(playlist)
)