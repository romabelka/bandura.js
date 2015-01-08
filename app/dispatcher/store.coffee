UIprogressbar = require('../UI/components/progressbar')
UIplayer = require('../UI/components/player')
UIvolume = require('../UI/components/volume')

class Store
  validFields = ['playlists', 'volume', 'mute', 'modules', 'progressbar', 'playingStatus']
  constructor: (@playlists=null, @volume = 40, @modules=['userPlaylists'])->
    @UIComponents =
      progressbar : React.render(`<UIprogressbar progress = {this.progress} loaded = {this.loaded}/>`, document.getElementById('bandura-progressbar'))
      player: React.render(`<UIplayer playingStatus = {this.playingStatus}/>`, document.getElementById('bandura-container'))
      volume: React.render(`<UIvolume volume = {this.volume}/>`, document.getElementById('bandura-volume'))

  update: (field, value) ->
    throw new Error 'invalid field for Store' unless field in validFields
    @[field] = value

    if field is 'progressbar'
      @UIComponents.progressbar.setProps(
        progress: value.progress
        loaded: value.loaded
      )
    else
      @UIComponents.player.setProps(@)
      console.log '----', @

module.exports = new Store()