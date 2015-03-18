{controls,progress, collections, settingsChanges, videos, buttons, soundEvents, notify} = require('./api')
PLCollection = require('../api/PLCollection')
Bandura = require('../api/Bandura')
Utils = require('../utils/utils')
controlsMethods = require './methods'

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
  if ev.playlist?
    return collection[ev.action](ev.playlist)
  else
    return collection[ev.action].apply(collection, ev.arguments)
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


playerActions = playlistsCollection.sampledBy(controls, (collection, task) ->
  playlist = collection.getActivePlaylist()
  try
    do controlsMethods(playlist, task)[task.action]
  catch err
    new Bacon.Error(err)
).flatMap((e) -> e).skipDuplicates()

soundEvents.onValue (ev) ->
  switch ev
    when 'finish'
      controls.push action: 'nextTrack'

callbacks = buttons.scan([], (buttons, ev) ->
  return buttons.concat ev
).combine(playlistsCollection, (buttons, collection) ->
  buttons
    .map (btn) -> _.extend(btn, callback: -> btn.action(collection.getActivePlaylist()?.getActiveTrack(), collection))
    .sort (a,b) -> a.order > b.order
)

videoSet = videos.flatMapLatest((query) ->
  protocol = window.location.protocol or 'http:'
  url = protocol + "//gdata.youtube.com/feeds/api/videos/-/Music?q=#{query}&hd=true&v=2&alt=jsonc&safeSearch=strict"
  Bacon.fromPromise(
    $.ajax
      url: url
      dataType: "jsonp"
)).map((response) -> response.data.items)

errors = playerActions.errors().flatMapError((err)->err.message)
notifications = notify.merge(errors).map((text) ->
  text: text
  timestamp: Date.now()
).slidingWindow(10)
module.exports = {progressbar, playerSettings, playlistsCollection, playerActions, videoSet, callbacks, soundEvents, notifications}

