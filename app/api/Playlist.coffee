Utils = require('../utils/utils')

class Playlist
  #Public
  constructor: (@_tracks = [], @_name = 'User playlist', @_activeTrackIndex = 0, @_id = Utils.randomId()) ->

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


  # [[Track], Int] => [Playlist]  track, optional: position, default add to end
  addTracks: (tracks, position)->
    if position?
      newTracks = Utils.insertOn @_tracks, tracks, position
      activeTrack = if position > @_activeTrackIndex then @_activeTrackIndex else @_activeTrackIndex + tracks.length
    else
      newTracks = @_tracks.concat tracks
      activeTrack = @_activeTrackIndex

    return new Playlist(newTracks, @_name, activeTrack, @_id)

  addTrack: (track, position) -> @addTracks([track], position)
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



module.exports = Playlist