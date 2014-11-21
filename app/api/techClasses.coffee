class @PlayerSettings
  constructor: (@volume, @mute) ->

  setVolume: (vol) -> return new PlayerSettings(vol, @mute)
  setMute: (mute) -> return new PlayerSettings(@volume, mute)


class @Track
  defaults: {
    artist: 'unknown artist'
    name: 'unknown track'
  }

  constructor: (data) ->
    _.extend(@, @defaults, data)


#================================================================================

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
    throw new Error('no next track') if @_activeTrackIndex >= @_tracks.length - 1

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

#================================================================================

class @PLCollection
  constructor: (playlists, sorted = false, ids = null) ->
    #sorting and inds just to make it faster
    @_playlists = if sorted then playlists else _.sortBy playlists, (pl) -> pl.getId()
    #its important to have ids in the same order that playlists
    @_plIds = ids or _.map @_playlists, (pl) -> pl.getId()

  #able to use it as update to
  addPlaylist: (playlist) ->
    id = playlist.getId()
    throw new Error 'Collection allready contains this playlist' if _.contains(@_plIds, id)

    position = _.sortedIndex(@_plIds, id)
    return new PLCollection Utils.insertOn(@_playlists, playlist, position), true, Utils.insertOn(@_plIds, id, position)

  removePlaylist: (playlist) ->
    position = _.sortedIndex(@_plIds, playlist.getId())

    return new PLCollection Utils.removeFrom(@_playlists, position), true, Utils.removeFrom(@_plIds, position)

  #updates a single playlist in collection(not removes or create it => no ids changed)
  update: (playlist) ->
    index = _.indexOf @_plIds, playlist.getId(),true
    return @addPlaylist(playlist) if index < 0
    list = @_playlists
    list[index] = playlist

    return new PLCollection list, true, @_plIds
