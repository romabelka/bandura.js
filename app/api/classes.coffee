class @Track
  defaults: {
    artist: 'unknown artist'
    name: 'unknown track'
  }

  constructor: (data) ->
    _.extend(@, @defaults, data)



class @Playlist
  #Public
  constructor: (@_tracks = [], @_name = 'Custom playlist', @_activeTrackIndex = 0, @_id = Utils.randomId()) ->

  getName: -> @_name
  getTracks: -> @_tracks
  getId: -> @_id
  getActiveTrack: -> @_tracks[@_activeTrackIndex]
  getActiveTrackIndex: -> @_activeTrackIndex

  # [Int] => [Playlist]
  changeTrack: (trackIndex) ->
    return new Playlist(@_tracks, @_name, trackIndex, @_id)

  nextTrack: ->
    throw new Error('no next track') if @_activeTrackIndex >= @_tracks.length

    return @changeTrack(@_activeTrackIndex + 1)

  previousTrack: ->
    throw new Error('no previous track') if @_activeTrackIndex <= 0

    return @changeTrack(@_activeTrackIndex - 1)


  # [Track, Int] => [Playlist]  track, optional: position, default add to end
  addTrack: (track, position)->
    if position
      tracks = Utils.insertOn @_tracks, track, position
      activeTrack = if position > @_activeTrackIndex then @_activeTrackIndex else @_activeTrackIndex + 1
    else
      tracks = @_tracks.concat track
      activeTrack = @_activeTrackIndex

    return new Playlist(tracks, @_name, activeTrack, @_id)

  # [Int] or [Track] => [Playlist]
  removeTrack: (opt) ->
    if opt instanceof Track
      tracks = _.without(@_tracks, opt)
      delta = _.sortedIndex(Utils.allIndexOf(@_tracks, opt), @_activeTrackIndex)
      activeTrack = @_activeTrackIndex - delta
    else
      tracks = Utils.removeFrom(@_tracks, opt)
      activeTrack = if opt <= @_activeTrackIndex then @_activeTrackIndex else @_activeTrackIndex - 1

    return new Playlist(tracks, @_name, activeTrack, @_id)


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
    playerSettings.push({volume: @volume, mute: false})
    return @
  mute: () ->
    playerSettings.push({volume: @volume, mute: true})

  unmute: () ->
    playerSettings.push({volume: @volume, mute: false})

  getVolume: -> @volume

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




