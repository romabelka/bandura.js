Track = require './track'
{collections} = require '../../dispatcher/api'

module.exports = React.createClass
  displayName: 'Playlist'
  getInitialState: ->
    {
      showLeftScroll:yes
      showRightScroll:yes
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
    @setState scrolling: setInterval(=>
      @setState position: @state.position - 50
    ,50)
  scrollRight: (ev) ->
    @setState scrolling: setInterval(=>
      @setState position: @state.position + 50
    ,50)

  finishScrolling: ->
    clearInterval(@state.scrolling) if @state.scrolling?

  componentDidMount: () ->
    ul = @refs.tracklist.getDOMNode()


  render: ->
    return false unless @props.playlist?

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
        <div className="b-playlist" onDrop={this.drop} onDragOver={this.dragOver}>
          {leftScroll}
          {rightScroll}
          <ul className="b-playlist--tracks" ref="tracklist" style={{left:this.state.position}}>
            {tracks}
          </ul>
        </div>
      )`
