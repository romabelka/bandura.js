{controls, collections} = require('../../dispatcher/api')
module.exports = React.createClass
  displayName: 'Track'
  play: ->
    controls.push action: 'stop'
    collections.push
      action: 'updateActive'
      playlist: @props.playlist.changeTrack(@props.index)
    controls.push action: 'play'
  pause: ->
    controls.push action: 'pause'
  resume: ->
    controls.push action: 'play'

  render: ->
    className = 'b-track'
    className += ' b-track__playing' if @props.isPlaying
    className += ' b-track__active' if @props.isActive
    actionIconClass = if @props.isPlaying then 'b-icon__pause' else 'b-icon__play'
    if @props.track.cover
      cssImage =
        backgroundImage: 'url(' + @props.track.cover + ')'

    action = if @props.isActive
          if @props.isPlaying then @pause else @resume
      else @play

    return `(
      <div className={className} onClick={action}>
        <div className="b-track__cover">
          <div className="b-track__cover__blur b-track__cover-default-image" style={cssImage}></div>
          <div className="b-track__cover__circle  b-track__cover-default-image" style={cssImage}></div>
          <div className="b-track__cover__btn-action">
            <i className={'b-icon ' + actionIconClass}></i>
            <div className="b-track__cover__blur-circle b-track__cover-default-image" style={cssImage}></div>
          </div>
        </div>
        <div className="b-track__text b-track__text_artist">{this.props.track.artist}</div>
        <div className="b-track__text b-track__text_name">{this.props.track.name}</div>
      </div>
    );`
