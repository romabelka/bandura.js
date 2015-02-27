module.exports = React.createClass
  render: ->
    return `(
      <ol className = "b-player--buttons">
      {this.props.enabledButtons.map(function(btn, index) {
        return (
          <li className={'b-btn ' + btn.className} onClick={btn.callback} key={index}>
            <i className={'b-icon ' + btn.classNameIcon}></i>
          </li>
        )
      })}
      </ol>
    )`
