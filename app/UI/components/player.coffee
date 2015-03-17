{controls} = require('../../dispatcher/api')
Playlists = require './playlists'
Notification = require './notification'
Volume = require './volume'
Progressbar = require './progressbar'
Buttons = require './buttons'
VidoScreen = require './videoScreen'

module.exports = React.createClass
  displayName: 'Player'
  getInitialState: ->
    showPlaylists: no
    videoScreen: no

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

  closeVideoScreen: (ev)->
    ev.preventDefault()
    @setState videoScreen: no

  render: ->
    playClass = if @props.playingStatus is 'isPlaying' then 'b-icon__pause' else 'b-icon__play'
    currentTrack = @props.PLCollection?.getActivePlaylist()?.getActiveTrack()
    return `(
      <div className="b-bandura">
        <div className="b-player">
          <div className="b-player--section">
            <div className="b-controls">
              <div className="b-btn b-controls--button  b-tooltip" onClick={this.prevTrack} data-tooltip="Previous track">
                <i className="b-icon b-icon__fast-backward-1"></i>
              </div>
              <div className="b-btn b-controls--button  b-tooltip" onClick={this.playAction} data-tooltip="Play/Pause">
                <i className={'b-icon ' + playClass}></i>
              </div>
              <div className="b-btn b-controls--button  b-tooltip" onClick={this.nextTrack} data-tooltip="Next Track">
                <i className="b-icon b-icon__fast-forward-1"></i>
              </div>
            </div>
          </div>
          <div className="b-player--section" id='bandura-progressbar-section' />
          <div className="b-player--section" id='bandura-volume-section' />
          <div className="b-player--section">
            <Buttons enabledButtons={this.props.buttons} />
          </div>
        </div>
        <Notification/>
        <Playlists PLCollection={this.props.PLCollection} isPlaying={this.props.playingStatus} visible={this.state.showPlaylists}/>
        <VidoScreen videos = {this.props.videos} visible={this.state.videoScreen} closeScreen={this.closeVideoScreen} />
      </div>
    );`
