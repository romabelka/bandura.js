module.exports = React.createClass
  displayName: 'Track'

  render: ->
    className = 'b-track'
    className+= ' b-track__playing' if @props.isPlaying
    return `(
      <div className={className}>
        <div className="b-track__artist">{this.props.track.artist}</div>
        <div className="b-track__name">{this.props.track.name}</div>
      </div>
    );`