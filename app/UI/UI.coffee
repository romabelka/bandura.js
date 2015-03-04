UIplayer = require('./components/player')

module.exports = ->
  container = document.body.appendChild document.createElement('div')
  React.render(`<UIplayer playingStatus = {this.playingStatus} buttons={[]}/>`, container)
