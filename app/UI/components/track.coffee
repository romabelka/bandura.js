module.exports = React.createClass
  displayName: 'Track'

  render: ->
    return `(
      <div className="b-track">
        <div className="b-track__artist">{this.props.track.artist}</div>
        <div className="b-track__name">{this.props.track.name}</div>
      </div>
    );`