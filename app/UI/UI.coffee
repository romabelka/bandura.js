UIplayer = require('./components/player')
Volume = require('./components/volume')
Progressbar = require('./components/progressbar')

module.exports = ->
  container = document.body.appendChild document.createElement('div')
  components = {}
  components.player = React.render(`<UIplayer playingStatus = {this.playingStatus} buttons={[]}/>`, container, ->
    components.progressbar = React.render(`<Progressbar />`,document.getElementById('bandura-progressbar-section'))
    components.volume = React.render(`<Volume />`, document.getElementById('bandura-volume-section'))
  )
  return components