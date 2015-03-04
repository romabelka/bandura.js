Track = require './track'
{collections} = require '../../dispatcher/api'

module.exports = React.createClass
  displayName: 'Playlist'

  drop: (ev)->
    ev.preventDefault()
    collections.push
      action: 'update'
      playlist: @props.playlist.addTrack(JSON.parse ev.dataTransfer.getData('track'))
  dragOver: (ev) ->
    ev.preventDefault()

  render: ->
    return false unless @props.playlist?

    self = @

    tracks = _.map(this.props.playlist.getTracks(), (track, index) =>
      isActive = @props.isActive and index is @props.playlist.getActiveTrackIndex()
      isPlaying = isActive and @props.isPlaying
      return `(
        <li key={index} className="b-playlist--tracks-item">
          <Track playlist={self.props.playlist} track={track} index={index} isPlaying={isPlaying} isActive={isActive} key={index}/>
        </li>
      )`
    )

    return `(
        <div className="b-playlist" onDrop={this.drop} onDragOver={this.dragOver}>
          <ul className="b-playlist--tracks">
            {tracks}
          </ul>
        </div>
      )`
