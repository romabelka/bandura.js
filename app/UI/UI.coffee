UIplayer = require('./components/player')
Progressbar = require('./components/progressbar')

module.exports = ->
  container = document.body.appendChild document.createElement('div')
  components = {}
  components.player = React.render(`<UIplayer playingStatus = {this.playingStatus} buttons={[]}/>`, container, ->
    components.progressbar = React.render(`<Progressbar />`,document.getElementsByClassName('b-progressbar--wrapper')[0])
  )
  return components