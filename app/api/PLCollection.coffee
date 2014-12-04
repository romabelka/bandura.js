Utils = require('../utils/utils')

class PLCollection
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


module.exports = PLCollection