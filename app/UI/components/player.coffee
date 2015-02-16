{controls} = require('../../dispatcher/api')
Playlists = require './playlists'
Volume = require './volume'
Progressbar = require './progressbar'

module.exports = React.createClass
  displayName: 'Player'
  prevTrack: ->
    controls.push('previousTrack')
  nextTrack: ->
    controls.push('nextTrack')
  playAction: ->
    switch this.props.playingStatus
      when 'isPlaying'
        controls.push 'pause'
      when 'Paused'
        controls.push 'play'
      when 'Stoped'
        controls.push 'play'


  render: ->
    return `(
      <div>
      <div onClick={this.prevTrack}>Previous Track</div>
      <div onClick={this.playAction}>{this.props.playingStatus}</div>
      <div onClick={this.nextTrack}>Next Track</div>
      <Volume volume={this.props.volume} />
      <Progressbar progress={this.props.progress} loaded = {this.props.loaded} />
      <Playlists PLCollection={this.props.PLCollection} isPlaying={this.props.playingStatus}/>
      </div>
    );`