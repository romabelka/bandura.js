module.exports = React.createClass
  displayName: 'videoItem'

  getInitialState: ->
    showVideo: false

#    set b-video--item new class .video_active for visibility of wide video block
  render: ->
    return `(
    <div className='b-video--item'>
        <div className='b-video--popup'>
          <div className='b-video--popup--height'>
          </div>
          <div className='b-video--popup--wrapper'>BIG VIDEO</div>
        </div>
        <div className='b-video--picture'>
          <img className='b-video--picture--img' src={this.props.video.thumbnail.hqDefault}/>
        </div>

    </div>
    )`