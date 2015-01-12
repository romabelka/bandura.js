module.exports = React.createClass
  displayName: 'Playlist'

  render: ->
    tracks = this.props.playlist.getTracks()

    return `(
      <div>
      <ul>
      <li>track1</li>
      <li>track2</li>
      </ul>
      </div>
    );`