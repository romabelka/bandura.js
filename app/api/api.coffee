class @Player
  #private
  valideVolume = (vol) ->
    throw new Error 'must be a number' unless _.isNumber vol

    if vol < 0 then return 0
    else if vol > 100 then return 100
    else return vol

  # Public

  constructor: (options) ->
    _.extend(@, {
      volume: 20
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
    @volume = valideVolume(vol)
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

    activePlaylist.push(new Playlist([track])) if track
    controls.push('play')

    return @


  pause: () ->
    controls.push('pause')
    return @

  stop: () ->
    controls.push('stop')
    return @

  #------------Playlists----------
  setActivePlaylist: (pl) ->
    controls.push('stop')
    activePlaylist.push(pl)
    return @

  destroyActivePlaylist: () ->
    controls.push('stop')
    activePlaylist.push(new Playlist())
    return @

  playPlaylist: (pl) ->
    activePlaylist.push(pl)
    controls.push('play')
    return @

  nextTrack: () ->
    controls.push('nextTrack')
    return @

  previousTrack: () ->
    controls.push('previousTrack')
    return @




