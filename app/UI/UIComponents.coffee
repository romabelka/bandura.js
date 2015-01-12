UIprogressbar = require('./components/progressbar')
UIplayer = require('./components/player')
UIvolume = require('./components/volume')

UIComponents =
  progressbar : React.render(`<UIprogressbar progress = {this.progress} loaded = {this.loaded}/>`, document.getElementById('bandura-progressbar'))
  player: React.render(`<UIplayer playingStatus = {this.playingStatus}/>`, document.getElementById('bandura-container'))
  volume: React.render(`<UIvolume volume = {this.volume}/>`, document.getElementById('bandura-volume'))

module.exports = UIComponents