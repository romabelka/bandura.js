Playlist = require './playlist'

module.exports = React.createClass
  displayName: 'Playlists'
  getInitialState: ->
    visiblePlaylist: undefined

  showPlaylist: (id) ->
    return =>
      @setState
        visiblePlaylist: @props.PLCollection.getPlaylistById(id)

  render: ->
    self = @
    playlists = _.map(@props.PLCollection?.getAllPlaylists() or [], (pl) ->
      return `(
        <li onClick = {self.showPlaylist(pl.getId())} key={pl.getId()}>{pl.getName()}</li>
      )`
    )

    return `(
      <div>
      <ul>
      {playlists}
      </ul>
      <Playlist playlist={this.state.visiblePlaylist}/>
      </div>
    );`