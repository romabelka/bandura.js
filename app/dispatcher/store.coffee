class Store
  validFields = ['playlists', 'volume', 'mute', 'modules', 'progressbar', 'playing']
  constructor: (@playlists=null, @volume = 40, @modules=['userPlaylists'])->

  update: (field, value) ->
    throw new Error 'invalid field for Store' unless field in validFields
    @[field] = value
    console.log '----', @

module.exports = new Store()