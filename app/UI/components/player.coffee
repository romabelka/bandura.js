{controls} = require('../../dispatcher/api')
Playlists = require './playlists'
Notification = require './notification'
Volume = require './volume'
Progressbar = require './progressbar'
Buttons = require './buttons'
VidoScreen = require './videoScreen'

btnClasses = 'b-btn b-controls--button  b-tooltip'
module.exports = React.createClass
  displayName: 'Player'
  getInitialState: ->
    showPlaylists: no
    videoScreen: no

  prevTrack: ->
    controls.push action: 'previousTrack'
  nextTrack: ->
    controls.push action: 'nextTrack'
  playAction: ->
    switch this.props.playingStatus
      when 'isPlaying'
        controls.push action: 'pause'
      when 'Paused'
        controls.push action: 'play'
      when 'Stoped'
        controls.push action: 'play'

  closeVideoScreen: (ev)->
    ev.preventDefault()
    @setState videoScreen: no

  render: ->
    playClass = if @props.playingStatus is 'isPlaying' then 'b-icon__pause' else 'b-icon__play'
    activePlaylist = @props.PLCollection?.getActivePlaylist()
    currentTrack = activePlaylist?.getActiveTrack()
    hasNext = activePlaylist?.hasNext()
    hasPrev = activePlaylist?.hasPrevious()
    canPlay = currentTrack?

    return `(
      <div className="b-bandura">
        <div className="b-player">
          <div className="b-player--section">
            <div className="b-controls">
              <div className={hasPrev ? btnClasses:btnClasses+' disabled'} onClick={hasPrev ? this.prevTrack : null} data-tooltip="Previous track">
                <i className="b-icon b-icon__fast-backward-1"></i>
              </div>
              <div className={canPlay ? btnClasses:btnClasses+' disabled'} onClick={canPlay ? this.playAction : null} data-tooltip="Play/Pause">
                <i className={'b-icon ' + playClass}></i>
              </div>
              <div className={hasNext ? btnClasses:btnClasses+' disabled'} onClick={hasNext ? this.nextTrack : null} data-tooltip="Next Track">
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
        <Notification notifications = {this.props.notifications}/>
        <Playlists PLCollection={this.props.PLCollection} isPlaying={this.props.playingStatus} visible={this.state.showPlaylists}/>
        <VidoScreen videos = {this.props.videos} visible={this.state.videoScreen} closeScreen={this.closeVideoScreen} />
      </div>
    );`
