module.exports = React.createClass
  render: ->
    console.log '----', @props.enabledButtons
    buttons = for name of @props.enabledButtons
      `(<li className={this.props.enabledButtons[name].className} onClick={this.props.enabledButtons[name].action} key={name} />)`

    return `(
      <ol className = "b-player--buttons">
        {buttons}
      </ol>
    )`