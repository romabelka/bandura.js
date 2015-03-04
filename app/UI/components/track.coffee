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
    className += ' b-track__playing' if @props.isPlaying
    className += ' b-track__active' if @props.isActive
    actionIconClass = if @props.isPlaying then 'b-icon__pause' else 'b-icon__play'
    action = if @props.isActive
          if @props.isPlaying then @pause else @resume
      else @play
    return `(
      <div className={className} onClick={action}>
        <div className="b-track__cover">
          <div className="b-track__cover__blur" style={{backgroundImage: 'url(' + this.props.track.cover + ')'}}></div>
          <div className="b-track__cover__circle" style={{backgroundImage: 'url(' + this.props.track.cover + ')'}}></div>

          <div className="b-track__cover__btn-action" style={{backgroundImage: 'url(' + this.props.track.cover + ')'}}>
            <i className={'b-icon ' + actionIconClass}></i>
            <div className="b-track__cover__blur-circle" style={{backgroundImage: 'url(' + this.props.track.cover + ')'}}></div>
          </div>
        </div>
        <div className="b-track__text b-track__text_artist">{this.props.track.artist}</div>
        <div className="b-track__text b-track__text_name">{this.props.track.name}</div>
      </div>
    );`
