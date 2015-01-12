module.exports = React.createClass
  displayName: 'Playlists'

  render: ->
    playlists = _.map(@props.PLCollection?.getAllPlaylists() or [], (pl) ->
      return `(
        <li>{pl.getName()}</li>
      )`
    )

    return `(
      <div>
      <ul>
      {playlists}
      </ul>
      </div>
    );`