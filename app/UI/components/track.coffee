{controls, collections} = require('../../dispatcher/api')
module.exports = React.createClass
  displayName: 'Track'
  play: ->
    controls.push 'stop'
    collections.push
      action: 'updateActive'
      playlist: @props.playlist.changeTrack(@props.index)
    controls.push 'play'
  pause: ->
    controls.push 'pause'
  resume: ->
    controls.push 'play'

  render: ->
    className = 'b-track'
    className+= ' b-track__playing' if @props.isPlaying
    action = if @props.isActive
        if @props.isPlaying then @pause else @resume
      else @play
    return `(
      <div className={className} onClick={action}>
        <div className="b-track__artist">{this.props.track.artist}</div>
        <div className="b-track__name">{this.props.track.name}</div>
      </div>
    );`