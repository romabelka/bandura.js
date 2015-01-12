Track = require './track'

module.exports = React.createClass
  displayName: 'Playlist'

  render: ->
    unless @props.playlist?
      return `(<div></div>)`

    tracks = _.map(this.props.playlist.getTracks(), (track) ->
      return `(
        <li>
        <Track track={track}/>
        </li>
      )`
    )

    return `(
        <div>
        {this.props.playlist.getName()}
        <ul>
        {tracks}
        </ul>
        </div>
      )`
