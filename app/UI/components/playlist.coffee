Track = require './track'

module.exports = React.createClass
  displayName: 'Playlist'

  render: ->
    return false unless @props.playlist?

    self = @

    tracks = _.map(this.props.playlist.getTracks(), (track, index) ->
      return `(
        <li key={index} className="b-playlist--tracks-item">
          <Track track={track} isPlaying = {self.props.isPlaying && track == self.props.playlist.getActiveTrack()} key={index}/>
        </li>
      )`
    )

    return `(
        <div className="b-playlist">
          <div className="b-playlist--title">
            {this.props.playlist.getName()}
          </div>
          <ul className="b-playlist--tracks">
            {tracks}
          </ul>
        </div>
      )`
