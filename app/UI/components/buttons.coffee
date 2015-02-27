module.exports = React.createClass
  render: ->
    buttons = for name of @props.enabledButtons
      `(<li className={'b-btn ' + this.props.enabledButtons[name].liClass} onClick={this.props.enabledButtons[name].action} key={name}>
      <i className={'b-icon ' + this.props.enabledButtons[name].iconClass}></i>
      </li>)`


    return `(
      <ol className = "b-player--buttons">
        {buttons}
      </ol>
    )`
