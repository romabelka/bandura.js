Bandura = require('../../api/Bandura')
{settingsChanges} = require('../../dispatcher/api')
changeVolume = (ev, refs) ->
  volume = (ev.clientX - refs.container.getDOMNode().getBoundingClientRect().left) * 2
  settingsChanges.push volume: volume


module.exports = React.createClass
  getInitialState: -> drag: no

  handleDrag: (e, ui) ->
    settingsChanges.push {volume: ui.position.left * 2}

  mute: ->
    settingsChanges.push {mute: not @props.mute}
  mouseDown: (ev) ->
    @setState drag: yes
    changeVolume(ev, @refs)

  mouseMove: (ev) ->
    return unless @state.drag
    changeVolume(ev, @refs)

  cancelDrag: () ->
    @setState drag: no

  render: () ->
    muteIcon = if @props.mute then 'b-icon__volume-off-1' else 'b-icon__volume'
    return `(
    <div
      className="b-volume"
      onMouseDown={this.mouseDown}
      onMouseMove={this.mouseMove}
      onMouseUp={this.cancelDrag}
      onMouseLeave={this.cancelDrag}
    >
    <i className= {'b-icon b-icon__mute ' + muteIcon} onClick={this.mute}></i>
    <div className="b-volume--container" ref="container">
      <div className="b-volume--draggable">
        <i className="b-icon b-icon__record b-draggable" style={{top:-26, left: this.props.volume / 2 - 5}}></i>
      </div>
    </div>
    </div>
    );`