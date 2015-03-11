Track = require './track'
{collections} = require '../../dispatcher/api'
#todo calculate this
defaultTrackWidth = 127;

module.exports = React.createClass
  displayName: 'Playlist'
  getInitialState: ->
    {
      showLeftScroll:no
      showRightScroll:no
      position: 0
      scrolling: null
    }
  drop: (ev)->
    ev.preventDefault()
    collections.push
      action: 'update'
      playlist: @props.playlist.addTrack(JSON.parse ev.dataTransfer.getData('track'))
  dragOver: (ev) ->
    ev.preventDefault()

  scrollLeft: (ev) ->
    @setState showRightScroll: yes
    @setState scrolling: setInterval(=>
      if @state.position >=0
        @finishScrolling()
        @setState showLeftScroll: no
      @setState position: @state.position + 50
    ,50)
  scrollRight: (ev) ->
    @setState showLeftScroll: yes
    @setState scrolling: setInterval(=>
      if @state.position <= @refs.playlist.getDOMNode().getBoundingClientRect().width - @props.playlist.getTracks().length * defaultTrackWidth
        @finishScrolling()
        @setState showRightScroll: no
        return
      @setState position: @state.position - 50
    ,50)

  finishScrolling: ->
    clearInterval(@state.scrolling) if @state.scrolling?

  componentDidMount: () ->
    tracks = @props.playlist?.getTracks()
    return unless tracks
    width = @refs.playlist.getDOMNode().getBoundingClientRect().width
    @setState(showRightScroll: yes) if width < tracks.length * defaultTrackWidth

  componentWillReceiveProps: (nextProps) ->
    return unless nextProps.playlist?
    changedPlaylist = @props.playlist?.getId() isnt nextProps.playlist.getId()
    @setState({position: 0, showLeftScroll: no}) if changedPlaylist
    @setState showRightScroll: @state.position >= @refs.playlist.getDOMNode().getBoundingClientRect().width - nextProps.playlist.getTracks().length * defaultTrackWidth


  render: ->
    return `<div className="b-playlist" ref="playlist" />` unless @props.playlist?

    self = @

    tracks = _.map(@props.playlist.getTracks(), (track, index) =>
      isActive = @props.isActive and index is @props.playlist.getActiveTrackIndex()
      isPlaying = isActive and @props.isPlaying
      return `(
        <li key={index} className="b-playlist--tracks-item">
          <Track playlist={self.props.playlist} track={track} index={index} isPlaying={isPlaying} isActive={isActive} key={index}/>
        </li>
      )`
    )
    leftScroll = `(
    <div className='b-playlist--scroll b-playlist--scroll__back'
      onMouseDown={this.scrollLeft}
      onMouseUp={this.finishScrolling}
      onMouseLeave={this.finishScrolling}
    >
        <i className="b-icon b-icon__left-open b-playlist--icon" />
    </div>)
    ` if @state.showLeftScroll
    rightScroll = `(
    <div className='b-playlist--scroll b-playlist--scroll__forward'
    onMouseDown={this.scrollRight}
    onMouseUp={this.finishScrolling}
    onMouseLeave={this.finishScrolling}
    >
    <i className="b-icon b-icon__right-open b-playlist--icon" />
    </div>
    )` if @state.showRightScroll

    return `(
        <div className="b-playlist" onDrop={this.drop} onDragOver={this.dragOver} ref="playlist">
          {leftScroll}
          {rightScroll}
          <ul className="b-playlist--tracks" style={{left:this.state.position}}>
            {tracks}
          </ul>
        </div>
      )`
