Utils = require('../utils/utils')
Playlist = require('./Playlist')

class PLCollection
  @CUSTOM_ID = 0
  @FAVORITE_ID = 1

  constructor: (playlists, activeId=null) ->
    if playlists?
      @_playlists = playlists
    else
      @_playlists = [
        new Playlist [], 'Custom playlist', 0, PLCollection.CUSTOM_ID
        new Playlist [], 'Favourite', 0, PLCollection.FAVORITE_ID
      ]
    @_activeId = activeId
    @_plIds = @_playlists.map((pl) -> pl.getId())


  #able to use it as update to
  addPlaylist: (playlist, position = null) ->
    id = playlist.getId()
    throw new Error 'Collection allready contains this playlist' if _.contains(@_plIds, id)
    return new PLCollection Utils.insertOn(@_playlists, playlist, position or @_playlists.length), @_activeId

  removePlaylist: (playlist) ->
    position = @_playlists.indexOf(playlist)
    activeId = if @_activeId is playlist.getId() then null else @_activeId
    return new PLCollection Utils.removeFrom(@_playlists, position), activeId

  update: (playlist) ->
    #--updating by index--
    #no Array find
    currentPl = @getPlaylistById(playlist.getId())
    return @addPlaylist(playlist) unless currentPl
    index = @_playlists.indexOf currentPl
    list = Utils.updateOn @_playlists, index, playlist
    return new PLCollection list, @_activeId

  updateActive: (playlist) ->
    plc = @update(playlist)
    return if @_activeId? is playlist.getId() then plc else plc.setActivePlaylist(playlist)

  setActivePlaylist: (playlist) ->
    return new PLCollection(@_playlists, playlist.getId())

  addTracksToActivePlaylist: (tracks, index) ->
    throw new Error 'no Active playlist' unless @getActivePlaylist()
    return @updateActive(@getActivePlaylist().addTracks(tracks,index))

  #============GETERS===========
  getPlaylistById: (id) ->
    @_playlists.filter((pl) -> pl.getId() is id)[0]
    #throw new Error "there are no playlist with id=#{id}" unless playlist?
    #return playlist

  getAllPlaylists: () ->
    return @_playlists

  #returns null if no active playlist
  getActivePlaylist: () ->
    @getPlaylistById(@_activeId)

  getCustomPlaylist: () ->
    return @getPlaylistById(@CUSTOM_ID)

  getFavoritePlaylist: () ->
    return @getPlaylistById(@FAVORITE_ID)



module.exports = PLCollection