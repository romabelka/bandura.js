{controls,progress, activePlaylist, collections, settingsChanges} = require('../dispatcher/api')
#require('../dispatcher/api')
PlayerSettings = require('./PlayerSettings')
Track = require('./Track')
Playlist = require('./Playlist')
PLCollection = require('./PLCollection')

class Bandura
  #static
  @valideVolume = (vol) ->
    throw new Error 'must be a number' unless _.isNumber vol

    if vol < 0 then return 0
    else if vol > 100 then return 100
    else return vol

  # Public

  constructor: (options) ->
    _.extend(@, {
      volume: 0
    },options)

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
      else if _.isEmpty obj then currentTrack
      else new Track obj

    controls.push('stop')
    activePlaylist.push(new Playlist([track])) if track
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
  destroyActivePlaylist: () ->
    controls.push('stop')
    activePlaylist.push(new Playlist())
    return @

  playPlaylist: (pl) ->
    controls.push('stop')
    activePlaylist.push(pl)
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
    #todo test me
    activePlaylist.push(new Playlist tracks, 'Custom playlist', currentTrack, PLCollection.CUSTOM_ID)

  setActivePlaylist: (pl) ->
    controls.push('stop')
    activePlaylist.push(pl)
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
    collections.push({action: 'addPlaylist', playlist: pl})

    return @


module.exports = Bandura