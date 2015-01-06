UIprogressbar = require('../UI/components/progressbar')


class Store
  validFields = ['playlists', 'volume', 'mute', 'modules', 'progressbar', 'playing']
  constructor: (@playlists=null, @volume = 40, @modules=['userPlaylists'])->
    @UIComponents =
      progressbar : React.render(`<UIprogressbar progress = {this.progress} loaded = {this.loaded}/>`, document.getElementById('progressbar'))

  update: (field, value) ->
    throw new Error 'invalid field for Store' unless field in validFields
    @[field] = value

    if field is 'progressbar'
      @UIComponents.progressbar.setProps(
        progress: value.progress
        loaded: value.loaded
      )
    console.log '----', @

module.exports = new Store()