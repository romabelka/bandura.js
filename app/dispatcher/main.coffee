{controls,progress, activePlaylist, collections, settingsChanges, videos, buttons, soundEvents} = require('./api')
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

#activePlaylist.onValue((pl) -> collections.push({action: 'updateActive', playlist: pl}))

playlistsCollection = collections.scan(new PLCollection(), (collection, ev) ->
  return ev.collection if ev.action is 'setNewCollection'
  return collection[ev.action](ev.playlist)
)

playerActions = playlistsCollection.combine(controls, (a,b) ->
  {
  collection: a
  action: b
  }
).map((obj) ->
  if typeof obj.action is 'string'
    switch obj.action
      when 'stop'
        soundManager.destroySound(obj.collection.getActivePlaylist()?.getActiveTrack()?.id)
        Utils.extendImmutable obj.collection.getActivePlaylist(), {playingStatus: 'Stoped'}
      when 'play'
        console.log '----', obj.collection
        soundManager.pauseAll()
        if obj.collection.getActivePlaylist().getActiveTrack()
          soundManager.createSound(obj.collection.getActivePlaylist().getActiveTrack())
          soundManager.play(obj.collection.getActivePlaylist().getActiveTrack().id)
        Utils.extendImmutable obj.collection.getActivePlaylist(), {playingStatus: 'isPlaying'}

      when 'pause'
        soundManager.pauseAll()
        Utils.extendImmutable obj.collection.getActivePlaylist(), {playingStatus: 'Paused'}

      when 'nextTrack'
        nextTrack = obj.collection.getActivePlaylist().nextTrack()
        controls.push('stop')
        collections.push
          action: 'update'
          playlist: nextTrack
        controls.push('play')
        Utils.extendImmutable nextTrack, {result: 'switched to next track'}


      when 'previousTrack'
        previousTrack = obj.collection.getActivePlaylist().previousTrack()
        controls.push('stop')
        collections.push
          action: 'update'
          playlist: previousTrack
        controls.push('play')
        Utils.extendImmutable previousTrack, {result: 'switched to previous track'}

  else
    switch obj.action.type
      when 'setPosition'
        track = soundManager.getSoundById(obj.playlist.getActiveTrack().id)
        position = track.duration * obj.action.percent
        track.setPosition(position)

)


soundEvents.onValue (ev) ->
  switch ev
    when 'finish'
      controls.push 'nextTrack'

callbacks = buttons.scan([], (buttons, ev) ->
  return buttons.concat ev
).combine(activePlaylist.toProperty({}), (buttons, playlist) ->
  buttons
    .map (btn) -> _.extend(btn, callback: -> btn.action(playlist.getActiveTrack?(), playlist))
    .sort (a,b) -> a.order > b.order
)


module.exports = {progressbar, playerSettings, playlistsCollection, playerActions, videos, callbacks, soundEvents}