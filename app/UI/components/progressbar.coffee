width=500
{controls} = require('../../dispatcher/api')

module.exports = React.createClass
  displayName: 'Progressbar'
  getInitialState: ->
    {
    position:
      top  : 0
      left : 0
    }

  handleDrag: (e, ui) ->
    controls.push
      type: 'setPosition'
      percent: ui.position.left / width

  setPosition: (ev) ->
    controls.push
      type: 'setPosition'
      percent: (ev.clientX - ev.currentTarget.getBoundingClientRect().left) / width

  render: () ->
    return `(
    <div className="b-progressbar" style={{width:width}}>
      <div className="b-progressbar--container" onClick = {this.setPosition}>
      <div className="b-progressbar--loaded" style={{width: this.props.loaded ? this.props.loaded * width : 0}}></div>
        <ReactDraggable
        axis="x"
        bound="all box"
        onDrag={this.handleDrag}
        start={{y:0, x:this.props.progress ? this.props.progress * width : 0}}>

          <div className="b-progressbar--drag"></div>
        </ReactDraggable>
      </div>
    </div>
    );`


