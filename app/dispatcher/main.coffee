{controls,progress, activePlaylist, collections, settingsChanges} = require('./api')
PLCollection = require('../api/PLCollection')
Utils = require('../utils/utils')


#========frequently changed values============
progress.map((smTrack) ->
  {
  progress: smTrack.position / smTrack.duration
  loaded: smTrack.bytesLoaded / smTrack.bytesTotal
  }
).onValue((data) -> console.log(data))

playerSettings = settingsChanges.scan({},(settings, changes) ->
  if changes.mute? and changes.mute then soundManager.mute() else soundManager.unmute()
  if changes.volume?
    soundManager.setup({defaultOptions: {volume: changes.volume}})

  return Utils.extendImmutable(settings, changes)
).log('playerSettings')


#Changes volume of current track(SM can't change volume on all tracks)
playerSettings.changes().combine(activePlaylist, (a,b) ->
  {
    settings: a
    playlist: b
  }
).onValue((obj) ->
  {settings, playlist} = obj
  soundManager.setVolume(playlist.getActiveTrack().id, settings.volume)
)
#=============================================


activePlaylist.combine(controls, (a,b) ->
  {
    playlist: a
    action: b
  }
).map((obj) ->
  switch obj.action
    when 'stop'
      soundManager.stopAll()
      Utils.extendImmutable obj.playlist, {status: 'Stoped'}
    when 'play'
      soundManager.pauseAll()
      soundManager.createSound(obj.playlist.getActiveTrack())
      soundManager.play(obj.playlist.getActiveTrack().id)
      Utils.extendImmutable obj.playlist, {status: 'isPlaying'}

    when 'pause'
      soundManager.pauseAll()
      Utils.extendImmutable obj.playlist, {status: 'Paused'}

    when 'nextTrack'
      nextTrack = obj.playlist.nextTrack()
      controls.push('stop')
      activePlaylist.push(nextTrack)
      controls.push('play')
      Utils.extendImmutable nextTrack, {status: 'switched to next track'}


    when 'previousTrack'
      previousTrack = obj.playlist.previousTrack()
      controls.push('stop')
      activePlaylist.push(previousTrack)
      controls.push('play')
      Utils.extendImmutable previousTrack, {status: 'switched to previous track'}


).log('control')

activePlaylist.onValue((pl) -> collections.push({action: 'update', playlist: pl}))

playlistsCollection = collections.scan(new PLCollection(), (collection, ev) ->
  console.log '----', 'plCol', arguments
  return ev.collection if ev.action is 'setNewCollection'
  return collection[ev.action](ev.playlist)
).log('current playlists collection')