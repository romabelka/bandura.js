Playlist = require './playlist'
{collections} = require '../../dispatcher/api'

module.exports = React.createClass
  displayName: 'Playlists'

  getInitialState: ->
    visiblePlaylist: undefined
    showLeftScroll: no
    showRightScroll: no
    position: 0
    scrolling: null
    elWidth: null
    screenWidth: null

  removePlaylist: (pl) ->
    return ->
      collections.push({action: 'removePlaylist', playlist: pl})

  showPlaylist: (id) ->
    return =>
      @setState
        visiblePlaylistId: id

  getVisiblePlaylist: ->
    if this.props.PLCollection?
      if this.state.visiblePlaylistId?
        this.props.PLCollection.getPlaylistById(this.state.visiblePlaylistId)
      else
        this.props.PLCollection.getActivePlaylist()
    else null

  scrollLeft: (ev) ->
    @setState showRightScroll: yes
    @setState scrolling: setInterval(=>
      if @state.position >=0
        @finishScrolling()
        @setState showLeftScroll: no
      @setState position: @state.position + 45
    , 50)

  scrollRight: (ev) ->
    @setState showLeftScroll: yes
    @setState scrolling: setInterval(=>
      if @state.position <= @state.screenWidth - @props.PLCollection.getAllPlaylists().length * @state.elWidth
        @finishScrolling()
        @setState showRightScroll: no
        return
      @setState position: @state.position - 45
    , 50)

  finishScrolling: ->
    clearInterval(@state.scrolling) if @state.scrolling?

  componentDidUpdate: (prevProps) ->
    return if (@state.screenWidth or not @props.visible)
    screenWidth = @refs.playlists.getDOMNode().getBoundingClientRect().width
    itemWidth = @refs.playlists.getDOMNode().children[0].children[0].getBoundingClientRect().width + 5

    @setState
      screenWidth: screenWidth
      elWidth: itemWidth
      showRightScroll: screenWidth <= @props.PLCollection?.getAllPlaylists().length * itemWidth

  componentWillReceiveProps: (nextProps) ->
    return if @props.PLCollection?.getAllPlaylists().length < 3
    return unless @state.screenWidth
    @setState showRightScroll: @state.screenWidth <= @props.PLCollection?.getAllPlaylists().length * @state.elWidth

  render: ->
    self = @
    playlists = _.map(@props.PLCollection?.getAllPlaylists() or [], (pl) =>
      className = 'b-playlists--menu--item '
      className += 'b-playlists--menu--item__active ' if pl.getId() is @props.PLCollection.getActivePlaylist()?.getId()
      if @state.visiblePlaylistId?
        className += 'b-playlists--menu--item__selected ' if pl.getId() is @state.visiblePlaylistId

      return `(
        <li onClick = {self.showPlaylist(pl.getId())} className={className} key={pl.getId()}><i onClick={self.removePlaylist(pl)} className='b-icon b-icon__cancel'></i>{pl.getName()}</li>
      )`
    )

    leftScroll = `(
      <div className='b-playlists--scroll b-playlists--scroll__back'
      onMouseEnter={this.scrollLeft}
      onMouseUp={this.finishScrolling}
      onMouseLeave={this.finishScrolling}
      >
      <i className="b-icon b-icon__left-open b-playlist--icon" />
      </div>
    )` if @state.showLeftScroll

    rightScroll = `(
      <div className='b-playlists--scroll b-playlists--scroll__forward'
      onMouseEnter={this.scrollRight}
      onMouseUp={this.finishScrolling}
      onMouseLeave={this.finishScrolling}
      >
      <i className="b-icon b-icon__right-open b-playlist--icon" />
      </div>
    )` if @state.showRightScroll

    visiblePlaylist = @getVisiblePlaylist()

    isActive = @props.PLCollection?.getActivePlaylist()?.getId() is visiblePlaylist?.getId()
    isPlaying = @props.isPlaying is 'isPlaying' and isActive
    return false unless @props.visible
    return `(
      <div className="b-playlists" ref="playlists">
        {leftScroll}
        {rightScroll}
        <ul className="b-playlists--menu" style={{left:this.state.position}}>
          {playlists}
        </ul>
        <Playlist playlist={visiblePlaylist} isPlaying={isPlaying} isActive={isActive}/>
      </div>
    );`