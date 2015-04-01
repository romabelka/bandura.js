VideoItem = require './videoItem'
{controls} = require '../../dispatcher/api'
module.exports = React.createClass
  displayName: 'videoScreen'
  getInitialState: ->
    visibleVideo: no
  clickVideo: (video)->
    controls.push action: 'pause'
    @setState visibleVideo: video
  preventBubbling: (ev) ->
    ev.stopPropagation()
    ev.preventDefault()
    ev.nativeEvent.stopImmediatePropagation()

  render: ->
    return `(<div></div>)` unless (@props.videos? and @props.visible)
    self = @
    videoItems = @props.videos.map (video) ->
      `(<VideoItem video={video} key={video.id} onClick={self.clickVideo} showVideo={video==self.state.visibleVideo}/>)`
    return `(
      <div className="b-video--background" onClick={this.props.closeScreen}>
        <div className="b-video" onClick={this.preventBubbling}>
            <span className="b-video--close" onClick={this.props.closeScreen}>&times;</span>
            {videoItems}
        </div>
      </div>
    )`