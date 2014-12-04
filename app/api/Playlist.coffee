Utils = require('../utils/utils')

class Playlist
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



module.exports = Playlist