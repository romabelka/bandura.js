module.exports = React.createClass
  componentDidMount: ->
    console.log '----', @refs.tooltip
    @refs.tooltip.onClick = -> console.log '----', 123
    console.log '----', @refs

  render: ->
    buttons = for btn in @props.enabledButtons
      `(<li className={'b-btn ' + btn.liClass + ' b-tooltip'} onClick={btn.callback} key={btn.name} data-tooltip={btn.tooltip}>
          <i className={'b-icon ' + btn.iconClass}></i>
        </li>)`


    return `(
      <ol className = "b-player--buttons" ref='tooltip' onClick = {this.clickme}>
        {buttons}
      </ol>
    )`
