module.exports = React.createClass
  handleStart: (event, ui) ->
    console.log('Event: ', event)
    console.log('Position: ', ui.position)


  handleDrag: (event, ui) ->
    console.log('Event: ', event);
    console.log('Position: ', ui.position);

  handleStop: (event, ui) ->
    console.log('Event: ', event)
    console.log('Position: ', ui.position)

  render: () ->
    return `(<ReactDraggable
    axis="x"
    handle=".handle"
    grid={[25, 25]}
    start={{x: 25, y: 25}}
    zIndex={100}
    onStart={this.handleStart}
    onDrag={this.handleDrag}
    onStop={this.handleStop}>
    <div>
    <div className="handle">Drag from here</div>
                        <div>Lorem ipsum...</div>
    </div>
                </ReactDraggable>
    );`