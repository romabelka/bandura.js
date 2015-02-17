Track = require './track'

module.exports = React.createClass
  displayName: 'Playlist'

  render: ->
    unless @props.playlist?
      return `(<div></div>)`
    self = @
    tracks = _.map(this.props.playlist.getTracks(), (track, index) ->
      return `(
        <li key={index} className="b-playlist--li">
        <Track track={track} isPlaying = {self.props.isPlaying && track == self.props.playlist.getActiveTrack()} key={index}/>
        </li>
      )`
    )

    return `(
        <div className="b-playlist">
        {this.props.playlist.getName()}
        <ul>
        {tracks}
        </ul>
        </div>
      )`
