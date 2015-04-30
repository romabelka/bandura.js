{controls,progress, collections, settingsChanges, videos, buttons, soundEvents, notify} = require('../dispatcher/api')
PlayerSettings = require('./PlayerSettings')
defaultBtns = require('./defaultBtns')
Track = require('./Track')
Playlist = require('./Playlist')
PLCollection = require('./PLCollection')

class Bandura
  # Public

  constructor: (options) ->
    @volume = options.volume or 40
    @_remoteSettings = options.remote

    settingsChanges.push(new PlayerSettings @volume, false)

    soundManager.setup
      url: "http://localhost/required/swf/"
      debugFlash: false
      debugMode: false
      consoleOnly: true
      flashLoadTimeout: 5000
      flashVersion: 9
      useHighPerformance: true
      preferFlash: false
      useHTML5Audio: true
      useFlashBlock: true
      html5PollingInterval: 1000
      flashPollingInterval: 1000
      defaultOptions:
        volume: @volume
        whileplaying: -> progress.push(@)
        whileloading: -> progress.push(@)

    soundManagerEvents.forEach (ev) -> soundManager.setup defaultOptions: "on#{ev}": -> soundEvents.push(ev)
    {@UI, @events} = do render
    {remoteBtn, youtubeBtn, togglePlaylistsBtn} = defaultBtns(@)
    defaultButtons = [remoteBtn, youtubeBtn, togglePlaylistsBtn]
    buttons.push buttons: defaultButtons
    buttons.push(buttons: options.buttons) if options.buttons?





  #todo validate
  setVolume: (vol) ->
    @volume = Bandura.valideVolume(vol)
    settingsChanges.push({volume: @volume})
    return @
  mute: () ->
    settingsChanges.push({mute: true})

  unmute: () ->
    settingsChanges.push({mute: false})

  #todo merge playTrack and playPlaylist into one method
  # [Track] or [create track] or () -> nothing
  playTrack: (obj) ->
    track =
      if obj instanceof Track or not obj? then obj
      else if _.isEmpty obj then throw new error 'track cant be empty object'
      else new Track obj

    controls.push(action: 'stop')
    @setCustomPlaylist [track]
    controls.push(action: 'play')

    return @


  pause: () ->
    controls.push(action: 'pause')
    return @

  stop: () ->
    controls.push(action: 'stop')
    return @

  play: () ->
    controls.push(action: 'play')
    return @

  setPosition: (percent) ->
    controls.push
      action : 'setPosition'
      percent: percent

    return @

  #------------Playlist----------
  playPlaylist: (pl) ->
    controls.push(action: 'stop')
    if pl instanceof Playlist
      collections.push
        action: 'updateActive'
        playlist: pl
    else @setCustomPlaylist.apply(@, arguments)
    controls.push(action: 'play')
    return @

  nextTrack: () ->
    controls.push(action: 'nextTrack')
    return @

  previousTrack: () ->
    controls.push(action: 'previousTrack')
    return @

  #-----------PlaylistCollections---------
  setCustomPlaylist: (tracks, currentTrack = 0) ->
    #todo implement me
    collections.push
      action: 'updateActive'
      playlist: new Playlist tracks, 'Custom playlist', currentTrack, PLCollection.CUSTOM_ID

  setActivePlaylist: (pl) ->
    controls.push(action: 'stop')
    collections.push
      action: 'updateActive'
      playlist: pl
    return @

  #[Array[Playlist]] or [PLCollection] => [Player]
  setPlaylistsCollection: (collection) ->
    collection = new PLCollection(collection) unless collection instanceof PLCollection
    collections.push({action: 'setNewCollection', collection: collection})
    return @

  removePlaylist: (pl) ->
    collections.push({action: 'removePlaylist', playlist: pl})
    return @

  addPlaylist: (pl) ->
    if Array.isArray(pl)
      pl = new Playlist(pl, arguments[1])
    collections.push({action: 'addPlaylist', playlist: pl})
    return @

  #[Track]
  addTracksToActivePlaylist: (tracks, index) ->
    collections.push
      action: 'addTracksToActivePlaylist'
      arguments: arguments

  #--------Remote------------------
  #settings can be set here or when Bandura is created('remote' field).
  #required: host; example host: 'ws://localhost:3000'
  #optional: actions; to map your actions to Bandura's format, example 'next track': 'nextTrack';
  setRemote: (data) ->
    _.extend(@_remoteSettings, data)

  startRemote: (settings) ->
    settings or= @_remoteSettings
    return @notify('please login to use remote') unless settings.userURI
    all = new WebSocket(settings.host + '/'+ settings.userURI)
    instance = new WebSocket(settings.host + '/'+ settings.userURI + '/' + Utils.randomId())
    all.onopen = =>
      remoteActions = Bacon.fromEventTarget(all , 'message', (ev) -> action: settings.actions?[ev.data] or ev.data)
        .merge(Bacon.fromEventTarget(instance , 'message', (ev) -> action: settings.actions?[ev.data] or ev.data))
      controls.plug(remoteActions)
      @notify 'Remote control is ready'
      @removeButtons(['Remote'])
      @addButtons([defaultBtns(@).stopRemoteBtn(all, instance)])
    all.onclose = =>
      @notify "Remote control has been closed"
      @removeButtons(['Stop remote'])
      @addButtons([defaultBtns(@).remoteBtn])
    all.onerror = =>
      @notify "Can't start remote control"

  #--------Youtube----------------
  findYouTubeVideos: (track) ->
    @UI.player.setState videoScreen: true
    throw new Error('Noting is playing right now') unless track
    query = track.artist or '' + ' ' + track.name or ''
    videos.push query

  #-----buttons-----------------
  addButtons:(additionalButtons) ->
    buttons.push buttons: additionalButtons
    return @

  # ([String])
  removeButtons: (names) ->
    buttons.push
      remove: true
      buttons: names

  notify: (text) ->
    notify.push text
  #=======================static======================
  @valideVolume = (vol) ->
    throw new Error 'must be a number' unless _.isNumber vol

    if vol < 0 then return 0
    else if vol > 100 then return 100
    else return vol

  @Track = Track
  @Playlist = Playlist
  @PLCollection = PLCollection


#========Private========
  soundManagerEvents = ['load','play', 'pause', 'resume', 'stop', 'failure', 'finish']







module.exports = Bandura
render = require '../dispatcher/render'

