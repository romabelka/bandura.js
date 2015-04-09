{notify} = require '../../dispatcher/api'

module.exports = React.createClass
  componentDidMount: ->
    console.log '----', @refs.tooltip
    @refs.tooltip.onClick = -> console.log '----', 123
    console.log '----', @refs

  handleClick: (btn) ->
    return =>
      try
        btn.callback.apply(@, arguments)
      catch err
        notify.push(err.message)

  render: ->
    buttons = for btn in @props.enabledButtons
      `(<li className={'b-btn ' + btn.liClass + ' b-tooltip'} onClick={this.handleClick(btn)} key={btn.name} data-tooltip={btn.tooltip}>
          <i className={'b-icon ' + btn.iconClass}></i>
        </li>)`


    return `(
      <ol className = "b-player--buttons" ref='tooltip' onClick = {this.clickme}>
        {buttons}
      </ol>
    )`
