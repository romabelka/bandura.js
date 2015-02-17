module.exports = React.createClass
  render: ->
    return `(
      <ol className = "b-player--buttons">
      {this.props.enabledButtons.map(function(btn) {
        return <li className={btn.className} onClick={btn.callback}/>
      })}
      </ol>
    )`