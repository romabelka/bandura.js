window.tracks = require './fixtures/tracks'
window.playlists = require './fixtures/playlists'
Track = Bandura.Track

window.bandura = new Bandura
  remote:
    host: 'ws://localhost:3000'
    actions:
      Previous: 'previousTrack'
      Next: 'nextTrack'
      Play: 'play'
      Pause: 'pause'
  buttons: [
    name: 'Custom'
    order: 4
    action: (track)-> alert(track?.name)
    liClass: 'b-player--network'
    iconClass: 'b-icon__network'
    tooltip: 'Some custom button'
  ]

$(->
  for track in tracks
    el = $('<td>').text(track.name).appendTo('.js-tracks')
    el.click ((tr)-> -> bandura.playTrack(tr))(track)
    el.on 'dragstart', ((tr) -> (ev)-> ev.originalEvent.dataTransfer.setData 'track', JSON.stringify tr)(track)

  for playlist in playlists
    el = $('<td>').text(playlist.getName()).appendTo('.js-playlists')
    el.click ((pl)-> -> bandura.playPlaylist(pl))(playlist)
  $('td').attr('draggable', true)

  $('#testing').on('drop', (ev) ->
    ev.preventDefault()
    track = new Track JSON.parse(ev.originalEvent.dataTransfer.getData 'track')
    console.log '----', track
  ).on 'dragover', (ev) ->
    ev.preventDefault()
    console.log '----', 1111
)
