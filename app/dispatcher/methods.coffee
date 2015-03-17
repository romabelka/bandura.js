Utils = require '../utils/utils'
{controls, collections} = require './api'

module.exports = (playlist, task) ->
  stop: ->
    soundManager.stop(playlist?.getActiveTrack()?.id)
    Utils.extendImmutable playlist, {playingStatus: 'Stoped'}
  play: ->
    soundManager.pauseAll()
    if playlist?.getActiveTrack()
      soundManager.createSound(playlist.getActiveTrack())
      soundManager.play(playlist.getActiveTrack().id)
    Utils.extendImmutable playlist, {playingStatus: 'isPlaying'}

  pause: ->
    soundManager.pauseAll()
    Utils.extendImmutable playlist, {playingStatus: 'Paused'}

  nextTrack: ->
    nextTrack = playlist.nextTrack()
    do @stop
    collections.push
      action: 'update'
      playlist: nextTrack
    controls.push action: 'play'
    Utils.extendImmutable nextTrack, {result: 'switched to next track'}

  previousTrack: ->
    previousTrack = playlist.previousTrack()
    do @stop
    collections.push
      action: 'update'
      playlist: previousTrack
    controls.push action: 'play'
    Utils.extendImmutable previousTrack, {result: 'switched to previous track'}

  setPosition: ->
    track = soundManager.getSoundById(playlist.getActiveTrack().id)
    position = track.duration * task.percent
    track.setPosition(position)

