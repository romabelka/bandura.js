module.exports = React.createClass
  displayName: 'Progressbar'
  render: ->
    return `(
    <div>
    <p>progress: {this.props.progress} %</p>
    <p>loaded: {this.props.loaded} %</p>
    </div>
    );`