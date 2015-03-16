module.exports = React.createClass
  displayName: 'videoItem'

  handleClick: ->
    @props.onClick(@props.video)
#    set b-video--item new class .video_active for visibility of wide video block
  render: ->
    if @props.showVideo
      return `(
      <div className='b-video--item video_active'>
          <div className='b-video--popup'>
            <div className='b-video--popup--height'>
            </div>
            <div className='b-video--popup--wrapper'><iframe width="560" height="315" src={"https://www.youtube.com/embed/"+this.props.video.id} frameBorder="0" allowFullScreen /></div>
          </div>
          <div className='b-video--wrapper'>
            <div className='b-video--picture'>
              <img src={this.props.video.thumbnail.hqDefault}/>
            </div>
            <div className='b-video--title'>{this.props.video.title}</div>
          </div>

      </div>
      )`
    else
      `(
      <div className='b-video--item' onClick={this.handleClick}>
        <div className='b-video--wrapper'>
          <div className='b-video--picture'>
            <img src={this.props.video.thumbnail.hqDefault}/>
          </div>
          <div className='b-video--title'>{this.props.video.title}</div>
        </div>

      </div>
      )`