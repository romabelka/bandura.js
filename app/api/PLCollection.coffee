Utils = require('../utils/utils')
Playlist = require('./Playlist')

class PLCollection
  @CUSTOM_ID = 0
  @FAVORITE_ID = 1

  constructor: (playlists, sorted = false, ids = null) ->
    if playlists?
      @_playlists = if sorted then playlists else _.sortBy playlists, (pl) -> pl.getId()
    else
      @_playlists = [
        new Playlist [], 'Custom playlist', 0, PLCollection.CUSTOM_ID
        new Playlist [], 'Favourite', 0, PLCollection.FAVORITE_ID
      ]
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

  #============GETERS===========
  getPlaylistById: (id) ->
    index = _.indexOf @_plIds, id, true
    throw new Error "there are no playlist with id=#{id}" if index < 0
    return @_playlists[index]

  getAllPlaylists: () ->
    return @_playlists

  getCustomPlaylist: () ->
    return @_playlists[@CUSTOM_ID]

  getFavoritePlaylist: () ->
    return @_playlists[@FAVORITE_ID]



module.exports = PLCollection