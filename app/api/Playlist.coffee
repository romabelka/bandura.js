Utils = require('../utils/utils')
Track = require './Track'

class Playlist
  #Public
  constructor: (tracks = [], @_name = 'User playlist', @_activeTrackIndex, @_id = Utils.randomId()) ->
    @_tracks = tracks.map (track) -> if (track instanceof Track) then track else new Track(track)

  getName: -> @_name
  getTracks: -> @_tracks
  getId: -> @_id
  getActiveTrack: -> @_tracks[@_activeTrackIndex]
  getActiveTrackIndex: -> @_activeTrackIndex

  # [Int] => [Playlist]
  changeTrack: (trackIndex) ->
    return @ if trackIndex is @_activeTrackIndex
    return new Playlist(@_tracks, @_name, trackIndex, @_id)

  nextTrack: ->
    throw new Error('no next track') if @_activeTrackIndex >= @_tracks.length - 1

    return @changeTrack(@_activeTrackIndex + 1)

  previousTrack: ->
    throw new Error('no previous track') if @_activeTrackIndex <= 0

    return @changeTrack(@_activeTrackIndex - 1)

  hasNext: -> (@_activeTrackIndex or 0) < @_tracks.length - 1
  hasPrevious: -> @_activeTrackIndex > 0


  # [[Track], Int] => [Playlist]  track, optional: position, default add to end
  addTracks: (tracks, position)->
    newTracks = Utils.insertOn @_tracks, tracks, position
    if position?
      activeTrack = if position > @_activeTrackIndex then @_activeTrackIndex else @_activeTrackIndex + tracks.length
    else
      activeTrack = @_activeTrackIndex
    activeTrack = undefined  unless @_activeTrackIndex
    return new Playlist(newTracks, @_name, activeTrack, @_id)

  addTrack: (track, position) -> @addTracks([track], position)
  # [Int] or [Track] => [Playlist]
  removeTrack: (track) ->
    position = @_tracks.indexOf(track)
    tracks = Utils.removeFrom(@_tracks, position)
    activeTrack =
      if position < @_activeTrackIndex
        @_activeTrackIndex
      else if position > @_activeTrackIndex
        @_activeTrackIndex - 1
      else undefined
    return new Playlist(tracks, @_name, activeTrack, @_id)



module.exports = Playlist