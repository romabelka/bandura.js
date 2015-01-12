{controls,progress, activePlaylist, collections, settingsChanges} = require('./api')
PLCollection = require('../api/PLCollection')
Bandura = require('../api/Bandura')
Utils = require('../utils/utils')
UIComponents = require('../UI/UIComponents')

#========frequently changed values============
progressbar = progress.map((smTrack) ->
  {
  progress: smTrack.position / smTrack.duration
  loaded: smTrack.bytesLoaded / smTrack.bytesTotal
  }
)
playerSettings = settingsChanges.scan({},(settings, changes) ->
  if changes.mute? and changes.mute then soundManager.mute() else soundManager.unmute()
  if changes.volume?
    changes.volume = Bandura.valideVolume(changes.volume)
    soundManager.setup({defaultOptions: {volume: changes.volume}})

  return Utils.extendImmutable(settings, changes)
)


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


playerActions = activePlaylist.combine(controls, (a,b) ->
  {
    playlist: a
    action: b
  }
).map((obj) ->
  if typeof obj.action is 'string'
    switch obj.action
      when 'stop'
        soundManager.stopAll()
        Utils.extendImmutable obj.playlist, {playingStatus: 'Stoped'}
      when 'play'
        soundManager.pauseAll()
        soundManager.createSound(obj.playlist.getActiveTrack())
        soundManager.play(obj.playlist.getActiveTrack().id)
        Utils.extendImmutable obj.playlist, {playingStatus: 'isPlaying'}

      when 'pause'
        soundManager.pauseAll()
        Utils.extendImmutable obj.playlist, {playingStatus: 'Paused'}

      when 'nextTrack'
        nextTrack = obj.playlist.nextTrack()
        controls.push('stop')
        activePlaylist.push(nextTrack)
        controls.push('play')
        Utils.extendImmutable nextTrack, {result: 'switched to next track'}


      when 'previousTrack'
        previousTrack = obj.playlist.previousTrack()
        controls.push('stop')
        activePlaylist.push(previousTrack)
        controls.push('play')
        Utils.extendImmutable previousTrack, {result: 'switched to previous track'}

  else
    switch obj.action.type
      when 'setPosition'
        track = soundManager.getSoundById(obj.playlist.getActiveTrack().id)
        position = track.duration * obj.action.percent
        track.setPosition(position)

)

activePlaylist.onValue((pl) -> collections.push({action: 'update', playlist: pl}))

playlistsCollection = collections.scan(new PLCollection(), (collection, ev) ->
  return ev.collection if ev.action is 'setNewCollection'
  return collection[ev.action](ev.playlist)
)


#====================Store Updates==============
progressbar.onValue((progressbar) ->
  UIComponents.progressbar.setProps(
    progress: progressbar.progress
    loaded: progressbar.loaded
  )
)

playerSettings.onValue((settings) ->
  console.log '---- vol', settings.volume
  UIComponents.volume.setProps
    volume: settings.volume
)

playlistsCollection.onValue((PLC) ->
  console.log '----', 'change in PLC'
)

playerActions.onValue((obj) ->
  UIComponents.player.setProps({playingStatus: obj.playingStatus}) if obj.playingStatus?
)
