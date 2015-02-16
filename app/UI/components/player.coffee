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
    playClass = if @props.playingStatus is 'isPlaying' then 'b-icon__pause' else 'b-icon__play'
    return `(
      <div className="b-player--wrapper">
      <div className="b-player">
        <div className="b-controls">
        <div className="b-controls--button" onClick={this.prevTrack}>
          <i className="b-icon b-icon__fast-backward-1"></i>
        </div>
        <div className="b-controls--button" onClick={this.playAction}>
          <i className={'b-icon ' + playClass}></i>
        </div>
        <div className="b-controls--button" onClick={this.nextTrack}>
                <i className="b-icon b-icon__fast-forward-1"></i>
        </div>
        </div>

        <div className="b-progressbar--wrapper">
        <span className="b-progressbar--track-info">asd</span>
        <span className="b-progressbar--track-time">asd</span>

        <Progressbar progress={this.props.progress} loaded = {this.props.loaded} />
        </div>
        <Volume volume={this.props.volume} />
        <Playlists PLCollection={this.props.PLCollection} isPlaying={this.props.playingStatus}/>
      </div>
      </div>
    );`