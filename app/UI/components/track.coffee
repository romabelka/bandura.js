{controls, activePlaylist} = require('../../dispatcher/api')
module.exports = React.createClass
  displayName: 'Track'
  play: ->
    controls.push 'stop'
    activePlaylist.push @props.playlist.changeTrack(@props.index)
    controls.push 'play'
  render: ->
    className = 'b-track'
    className+= ' b-track__playing' if @props.isPlaying
    return `(
      <div className={className} onClick={this.play}>
        <div className="b-track__artist">{this.props.track.artist}</div>
        <div className="b-track__name">{this.props.track.name}</div>
      </div>
    );`