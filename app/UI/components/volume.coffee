Bandura = require('../../api/Bandura')
{settingsChanges} = require('../../dispatcher/api')

module.exports = React.createClass
  getInitialState: ->
    {
      position:
        top  : -26
        left : 0
    }

  handleDrag: (e, ui) ->
    settingsChanges.push {volume: ui.position.left * 2}

  setVolume: (ev) ->
    settingsChanges.push
      volume: (ev.clientX - ev.currentTarget.getBoundingClientRect().left) * 2

  mute: ->
    settingsChanges.push {mute: not @props.mute}

  render: () ->
    muteIcon = if @props.mute then 'b-icon__volume-off-1' else 'b-icon__volume'
    return `(
    <div className="b-volume">
    <i className= {'b-icon b-icon__mute ' + muteIcon} onClick={this.mute}></i>
    <div className="b-volume--container" onClick={this.setVolume}>
    <ReactDraggable
    axis="x"
    handle=".handle"
    bound="all box"
    start={{y:-26, x:this.props.volume / 2}}
    onDrag={this.handleDrag}
    >
      <div className="b-volume--draggable">
      <i className="b-icon b-icon__record handle"></i>
      </div>
    </ReactDraggable>
    </div>
    </div>
    );`