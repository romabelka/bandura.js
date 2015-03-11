width=500
{controls} = require('../../dispatcher/api')

module.exports = React.createClass
  displayName: 'Progressbar'

  setPosition: (ev) ->
    controls.push
      type: 'setPosition'
      percent: (ev.clientX - ev.currentTarget.getBoundingClientRect().left) / width

  render: () ->
    currentTrack = @props.currentTrack
    trackInfo = 'Nothing is playing right now'
    showTime = ''

    if @props.position?
      trackInfo = "#{currentTrack.name} : #{currentTrack.artist}" if currentTrack?
      trackTime =
        min : Math.floor(@props.duration/60000)
        sec : Math.floor((@props.duration - Math.floor(@props.duration/60000)*60000)/1000)
        posMin : Math.floor(@props.position/60000)
        posSec : Math.floor((@props.position - Math.floor(@props.position/60000)*60000)/1000)
      showTime = "#{trackTime.posMin}:#{trackTime.posSec} / #{trackTime.min}:#{trackTime.sec}"
      progress = @props.position / @props.duration
    return `(
    <div className="b-progressbar--wrapper">
      <small className="b-progressbar--track--info">{trackInfo}</small>
      <small className="b-progressbar--track--time">{showTime}</small>


      <div className="b-progressbar" style={{width:width}}>
        <div className="b-progressbar--container" onClick = {this.setPosition}>
        <div className="b-progressbar--loaded" style={{width: this.props.loaded ? this.props.loaded * width : 0}}></div>
           <div className="b-draggable b-progressbar--drag" style={{top: -6, left: this.props.progress ? this.props.progress * width : 0}}></div>
        </div>
      </div>
    </div>
    );`


