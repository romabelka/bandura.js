{controls,progress, activePlaylist, collections, settingsChanges, videos, buttons, soundEvents} = require('../dispatcher/api')
#require('../dispatcher/api')
PlayerSettings = require('./PlayerSettings')
Track = require('./Track')
Playlist = require('./Playlist')
PLCollection = require('./PLCollection')

class Bandura
  soundManagerEvents = ['load','play', 'pause', 'resume', 'stop', 'failure', 'finish']
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
    defaultButtons = [
      name: 'Remote'
      order: 3
      action: (->@startRemote()).bind @
      liClass: 'b-player--network'
      iconClass: 'b-icon__network'
      tooltip: 'Start remote control'
    ,
      name: 'Youtube'
      order: 2
      action: @findYouTubeVideos.bind @
      liClass: 'b-player--youtube'
      iconClass: 'b-icon__youtube'
      tooltip: 'Search video on youtube'
    ,
      order: 1
      name: 'Toggle playlists'
      action: (-> @UI.player.setState showPlaylists: not @UI.player.state.showPlaylists).bind @
      liClass: 'b-player--show-pl'
      iconClass: 'b-icon__th-list'
      tooltip: 'open/close playlists'
    ]
    buttons.push defaultButtons
    buttons.push options.buttons if options.buttons?





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

    controls.push('stop')
    @setCustomPlaylist [track]
    controls.push('play')

    return @


  pause: () ->
    controls.push('pause')
    return @

  stop: () ->
    controls.push('stop')
    return @

  play: () ->
    controls.push('play')
    return @

  setPosition: (percent) ->
    controls.push
      type: 'setPosition'
      percent: percent

    return @

  #------------Playlist----------
  playPlaylist: (pl) ->
    controls.push('stop')
    if pl instanceof Playlist
      collections.push
        action: 'updateActive'
        playlist: pl
    else @setCustomPlaylist.apply(@, arguments)
    controls.push('play')
    return @

  nextTrack: () ->
    controls.push('nextTrack')
    return @

  previousTrack: () ->
    controls.push('previousTrack')
    return @

  #-----------PlaylistCollections---------
  setCustomPlaylist: (tracks, currentTrack = 0) ->
    #todo implement me
    collections.push
      action: 'updateActive'
      playlist: new Playlist tracks, 'Custom playlist', currentTrack, PLCollection.CUSTOM_ID

  setActivePlaylist: (pl) ->
    controls.push('stop')
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


  startRemote: (settings) ->
    settings or= @_remoteSettings
    ws = new WebSocket(settings.host)
    remoteActions = Bacon.fromEventTarget ws , 'message', (ev) -> settings.actions?[ev.data] or ev.data
    controls.plug(remoteActions)

  #--------Youtube----------------
  findYouTubeVideos: (track) ->
    @UI.setState videoScreen: true
    throw new Error('Noting is playing right now') unless track
    query = track.artist or '' + ' ' + track.name or ''
    protocol = window.location.protocol or 'http:'
    url = protocol + "//gdata.youtube.com/feeds/api/videos/-/Music?q=#{query}&hd=true&v=2&alt=jsonc&safeSearch=strict"
    videos.plug Bacon.fromPromise($.ajax
      url: url
      dataType: "jsonp"
    ).map((response) -> response.data.items)

  #-----buttons-----------------
  addButtons:(additionalButtons) ->
    buttons.push additionalButtons
  #=======================static======================
  @valideVolume = (vol) ->
    throw new Error 'must be a number' unless _.isNumber vol

    if vol < 0 then return 0
    else if vol > 100 then return 100
    else return vol



module.exports = Bandura
render = require '../dispatcher/render'

