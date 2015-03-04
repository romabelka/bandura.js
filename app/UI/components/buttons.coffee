module.exports = React.createClass
  render: ->
    buttons = for btn in @props.enabledButtons
      `(<li className={'b-btn ' + btn.liClass} onClick={btn.callback} key={btn.name}>
      <i className={'b-icon ' + btn.iconClass}></i>
      </li>)`


    return `(
      <ol className = "b-player--buttons">
        {buttons}
      </ol>
    )`
