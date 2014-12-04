class PlayerSettings
  constructor: (@volume, @mute) ->

  setVolume: (vol) -> return new PlayerSettings(vol, @mute)
  setMute: (mute) -> return new PlayerSettings(@volume, mute)


module.exports = PlayerSettings