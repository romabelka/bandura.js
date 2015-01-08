Bandura = require('../../api/Bandura')
{settingsChanges} = require('../../dispatcher/api')

module.exports = React.createClass
  getInitialState: ->
    {
      position:
        top  : 0
        left : 0
    }

  handleDrag: (e, ui) ->
    settingsChanges.push {volume: Bandura.valideVolume(ui.position.left)}
    @setState({
      position: ui.position
    });

  render: () ->
    return `(
    <div className="b-volume">
    Volume:
    <div className="b-volume__container">
    <ReactDraggable
    axis="x"
    handle=".handle"
    bound="all box"
    start={{y:0, x:this.props.volume}}
    onDrag={this.handleDrag}
    >
      <div>
      <div className="b-volume__drag handle"></div>
      </div>
    </ReactDraggable>
    </div>
    </div>
    );`