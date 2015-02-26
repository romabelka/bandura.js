module.exports = React.createClass
  displayName: 'videoItem'
  getInitialState: ->
    showVideo: false

  render: ->
    return `(
    <div className='b-video--item'>
        <img className='b-video--img' src={this.props.video.thumbnail.hqDefault}/>
    </div>
    )`