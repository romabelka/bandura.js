{controls,progress, collections, settingsChanges, videos, buttons, soundEvents, notify} = require('./api')
PLCollection = require('../api/PLCollection')
Bandura = require('../api/Bandura')
Utils = require('../utils/utils')
controlsMethods = require './methods'

#========frequently changed values============

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
#intrested in activeTrack progress only
progressbar = playlistsCollection.sampledBy(progress,(collection, smTrack) ->
  isActive = collection.getActivePlaylist().getActiveTrack().id is smTrack.id
  {smTrack, isActive}
).filter(({isActive}) -> isActive).map(({smTrack}) ->
  {
  position: smTrack.position
  duration: smTrack.duration
  loaded: smTrack.bytesLoaded / smTrack.bytesTotal
  }
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
  if ev.remove
    return buttons.filter((btn) -> not (btn.name in ev.buttons))
  else
    return buttons.concat ev.buttons
).combine(playlistsCollection, (buttons, collection) ->
  buttons
    .map (btn) -> Utils.extend(btn, callback: -> btn.action(collection.getActivePlaylist()?.getActiveTrack(), collection))
    .sort (a,b) -> a.order > b.order
)

videoSet = videos.flatMapLatest((query) ->
  protocol = window.location.protocol or 'http:'
  url = protocol + "//gdata.youtube.com/feeds/api/videos/-/Music?q=#{query}&hd=true&v=2&alt=jsonc&safeSearch=strict"
  Bacon.fromPromise(
    $.ajax
      url: url
      dataType: "jsonp"
)).flatMap (response) -> if response.data.items then response.data.items else new Bacon.Error(new Error('Nothing found'))

errors = playerActions.errors().merge(videoSet.errors()).flatMapError((err)->err.message)
notifications = notify.merge(errors).map((text) ->
  text: text
  timestamp: Date.now()
).slidingWindow(10)
module.exports = {progressbar, playerSettings, playlistsCollection, playerActions, videoSet, callbacks, soundEvents, notifications}

