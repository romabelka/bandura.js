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
    settingsChanges.push {volume: ui.position.left}

  setVolume: (ev) ->
    settingsChanges.push
      volume: (ev.clientX - ev.currentTarget.getBoundingClientRect().left)

  render: () ->
    return `(
    <div className="b-volume">
    <div className="b-volume--container" onClick={this.setVolume}>
    <ReactDraggable
    axis="x"
    handle=".handle"
    bound="all box"
    start={{y:-26, x:this.props.volume}}
    onDrag={this.handleDrag}
    >
      <div className="b-volume--draggable">
      <i className="b-icon b-icon__record handle"></i>
      </div>
    </ReactDraggable>
    </div>
    </div>
    );`