{controls,progress, collections, settingsChanges, videos, buttons, soundEvents} = require('./api')
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

playlistsCollection = collections.scan(new PLCollection(), (collection, ev) ->
  return ev.collection if ev.action is 'setNewCollection'
  return collection[ev.action](ev.playlist)
)

#Changes volume of current track(SM can't change volume on all tracks)
playerSettings.changes().combine(playlistsCollection, (a,b) ->
  {
    settings: a
    collection: b
  }
).onValue((obj) ->
  {settings, collection} = obj
  soundManager.setVolume(collection.getActivePlaylist()?.getActiveTrack()?.id, settings.volume)
)
#=============================================


playerActions = playlistsCollection.combine(controls, (a,b) ->
  {
  collection: a
  action: b
  }
).map((obj) ->
  if typeof obj.action is 'string'
    playlist = obj.collection.getActivePlaylist()
    switch obj.action
      when 'stop'
        soundManager.destroySound(playlist?.getActiveTrack()?.id)
        Utils.extendImmutable playlist, {playingStatus: 'Stoped'}
      when 'play'
        console.log '----', obj.collection
        soundManager.pauseAll()
        if playlist.getActiveTrack()
          soundManager.createSound(playlist.getActiveTrack())
          soundManager.play(playlist.getActiveTrack().id)
        Utils.extendImmutable playlist, {playingStatus: 'isPlaying'}

      when 'pause'
        soundManager.pauseAll()
        Utils.extendImmutable playlist, {playingStatus: 'Paused'}

      when 'nextTrack'
        nextTrack = playlist.nextTrack()
        controls.push('stop')
        collections.push
          action: 'update'
          playlist: nextTrack
        controls.push('play')
        Utils.extendImmutable nextTrack, {result: 'switched to next track'}


      when 'previousTrack'
        previousTrack = playlist.previousTrack()
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
).combine(playlistsCollection, (buttons, collection) ->
  buttons
    .map (btn) -> _.extend(btn, callback: -> btn.action(collection.getActivePlaylist()?.getActiveTrack(), collection))
    .sort (a,b) -> a.order > b.order
)


module.exports = {progressbar, playerSettings, playlistsCollection, playerActions, videos, callbacks, soundEvents}