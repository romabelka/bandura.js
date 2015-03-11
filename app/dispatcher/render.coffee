renderUI = require '../UI/UI'
{progressbar, playerSettings, playlistsCollection, playerActions, videos, callbacks, soundEvents} = require './main'

module.exports = ->
  UI = do renderUI
  playlistsCollection.onValue (PLC) ->
    UI.player.setProps PLCollection: PLC
    UI.progressbar.setProps currentTrack: PLC?.getActivePlaylist()?.getActiveTrack()

  progressbar.onValue (progressbar) ->
    UI.progressbar.setProps
      position: progressbar.position
      duration: progressbar.duration
      loaded: progressbar.loaded

  playerSettings.onValue (settings) ->
    UI.volume?.setProps settings


  playerActions.onValue (obj) ->
    UI.player.setProps({playingStatus: obj.playingStatus}) if obj.playingStatus?

  videos.onValue (videos) ->
    UI.player.setProps videos: videos

  callbacks.onValue (buttons) -> UI.player.setProps buttons: buttons

  banduraEvents = soundEvents.combine(playlistsCollection, (se,plc) ->
    collection: plc
    event: se
  )
  return {
  UI: UI
  events: banduraEvents
  }