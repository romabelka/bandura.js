tracks = require './tracks'
playlists = require './playlists'
$(->
  $('.js-tracks').on 'click', 'td', (ev) ->
    bandura.playTrack tracks[$(ev.currentTarget).data('track')]
  $('.js-playlists').on 'click', 'td', (ev) ->
    bandura.playPlaylist playlists[$(ev.currentTarget).data('playlist')]
)