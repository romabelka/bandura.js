UIplayer = require('./components/player')

module.exports = ->
  React.render(`<UIplayer playingStatus = {this.playingStatus}/>`, document.getElementById('bandura-container'))
