{controls,progress, activePlaylist, collections, settingsChanges, videos, buttons} = require('./api')
PLCollection = require('../api/PLCollection')
Bandura = require('../api/Bandura')
Utils = require('../utils/utils')

#========frequently changed values============
progressbar = progress.map((smTrack) ->
  {
  position: smTrack.position
  duration: smTrack.duration
  loaded: smTrack.bytesLoaded / smTrack.bytesTotal
  }
)
playerSettings = settingsChanges.scan({},(settings, changes) ->
  if changes.mute? and changes.mute then soundManager.mute() else soundManager.unmute()
  if changes.volume?
    changes.volume = Bandura.valideVolume(changes.volume)
    changes.mute = false
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
        soundManager.destroySound(obj.playlist.getActiveTrack().id)
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

activePlaylist.onValue((pl) -> collections.push({action: 'updateActive', playlist: pl}))

playlistsCollection = collections.scan(new PLCollection(), (collection, ev) ->
  return ev.collection if ev.action is 'setNewCollection'
  return collection[ev.action](ev.playlist)
)

callbacks = buttons.scan({}, (buttons, ev) ->
  #todo check _.extendImmutable
  return Utils.extendImmutable buttons, ev
).combine(activePlaylist.toProperty({}), (buttons, playlist) ->
  newBtns = _.mapObject(buttons, (btn) -> _.extend(btn, callback: -> btn.action(playlist.getActiveTrack?(), playlist)))
  newBtns
)
module.exports = {progressbar, playerSettings, playlistsCollection, playerActions, videos, callbacks}