renderUI = require '../UI/UI'
{progressbar, playerSettings, playlistsCollection, playerActions} = require './main'

module.exports = ->
  UI = do renderUI
  progressbar.onValue((progressbar) ->
    UI.setProps
      position: progressbar.position
      duration: progressbar.duration
      loaded: progressbar.loaded
  )

  playerSettings.onValue((settings) ->
    UI.setProps settings
  )

  playlistsCollection.onValue((PLC) ->
    console.log '----', 'change in PLC'
    UI.setProps
      PLCollection: PLC
  )

  playerActions.onValue((obj) ->
    UI.setProps({playingStatus: obj.playingStatus}) if obj.playingStatus?
  )
