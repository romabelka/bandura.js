width=500
{controls} = require('../../dispatcher/api')

module.exports = React.createClass
  displayName: 'Progressbar'

  setPosition: (ev) ->
    controls.push
      type: 'setPosition'
      percent: (ev.clientX - ev.currentTarget.getBoundingClientRect().left) / width

  render: () ->
    return `(
    <div className="b-progressbar" style={{width:width}}>
      <div className="b-progressbar--container" onClick = {this.setPosition}>
      <div className="b-progressbar--loaded" style={{width: this.props.loaded ? this.props.loaded * width : 0}}></div>
         <div className="b-draggable b-progressbar--drag" style={{top: -6, left: this.props.progress ? this.props.progress * width : 0}}></div>
      </div>
    </div>
    );`


