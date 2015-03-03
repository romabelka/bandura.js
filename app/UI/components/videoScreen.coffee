VideoItem = require './videoItem'

module.exports = React.createClass
  displayName: 'videoScreen'

  render: ->
    return `(<div></div>)` unless (@props.videos? and @props.visible)
    videoItems = @props.videos.map (video) ->
      `(<VideoItem video={video} key={video.id}/>)`
    return `(
    <div className="b-video">
        <a href='#' className="b-video--close" onClick={this.props.closeScreen}>X</a>
        {videoItems}
    </div>

    )`