{controls} = require('../../dispatcher/api')
Playlists = require './playlists'
Volume = require './volume'
Progressbar = require './progressbar'
Buttons = require './buttons'
VidoScreen = require './videoScreen'

module.exports = React.createClass
  displayName: 'Player'
  getInitialState: -> return {showPlaylists: true}

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

  showPlaylists: ->
    @setState
      showPlaylists: not @state.showPlaylists

  render: ->
    ###
        enabledButtons = [
          liClass: 'b-player--show-pl'
          iconClass: 'b-icon__th-list'
          callback: @showPlaylists
        ]
    ###

    playClass = if @props.playingStatus is 'isPlaying' then 'b-icon__pause' else 'b-icon__play'
    currentTrack = @props.PLCollection?.getActivePlaylist()?.getActiveTrack()
    trackInfo = 'Nothing is playing right now'
    showTime = ''


    if @props.position?
      trackInfo = "#{currentTrack.name} : #{currentTrack.artist}"
      trackTime =
        min : Math.floor(@props.duration/60000)
        sec : Math.floor((@props.duration - Math.floor(@props.duration/60000)*60000)/1000)
        posMin : Math.floor(@props.position/60000)
        posSec : Math.floor((@props.position - Math.floor(@props.position/60000)*60000)/1000)
      showTime = "#{trackTime.posMin}:#{trackTime.posSec} / #{trackTime.min}:#{trackTime.sec}"

    return `(
      <div className="b-player--wrapper">
        <div className="b-player">
          <div className="b-controls">
            <div className="b-btn b-controls--button" onClick={this.prevTrack}>
              <i className="b-icon b-icon__fast-backward-1"></i>
            </div>
            <div className="b-btn b-controls--button" onClick={this.playAction}>
              <i className={'b-icon ' + playClass}></i>
            </div>
            <div className="b-btn b-controls--button" onClick={this.nextTrack}>
              <i className="b-icon b-icon__fast-forward-1"></i>
            </div>
          </div>

          <div className="b-progressbar--wrapper">
            <span className="b-progressbar--track-info">{trackInfo}</span>
            <span className="b-progressbar--track-time">{showTime}</span>

            <Progressbar progress={this.props.position / this.props.duration} loaded = {this.props.loaded} />
          </div>

        <Volume volume={this.props.volume} mute={this.props.mute}/>
        <Buttons enabledButtons={this.props.buttons} />
      </div>
        <Playlists PLCollection={this.props.PLCollection} isPlaying={this.props.playingStatus} visible={this.state.showPlaylists}/>
        <VidoScreen videos = {this.props.videos} />
      </div>
    );`