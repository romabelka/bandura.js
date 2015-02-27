VideoItem = require './videoItem'

module.exports = React.createClass
  displayName: 'videoScreen'
  getInitialState: ->
    visible: true

  closeScreen: ->
    @setState visible:false

  render: ->
    return `(<div></div>)` unless (@props.videos? and @state.visible)
    videoItems = @props.videos.map (video) ->
      `(<VideoItem video={video} key={video.id}/>)`
    return `(
    <div className="b-video">
        <a href='#' onClick={this.closeScreen}>Close</a>
        {videoItems}
    </div>
    )`