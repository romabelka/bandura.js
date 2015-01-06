module.exports = React.createClass
  displayName: 'Player'
  prevTrack: ->
    this.props.bandura.previousTrack()
  nextTrack: ->
    this.props.bandura.nextTrack()
  playAction: ->
    switch this.props.playingStatus
      when 'isPlaying'
        this.props.bandura.pause()
      when 'Paused'
        this.props.bandura.play()
      when 'Stoped'
        this.props.bandura.play()


  render: ->
    return `(
      <div>
      <div onClick={this.prevTrack}>Previous Track</div>
      <div onClick={this.playAction}>{this.props.playingStatus}</div>
      <div onClick={this.nextTrack}>Next Track</div>
      </div>
    );`