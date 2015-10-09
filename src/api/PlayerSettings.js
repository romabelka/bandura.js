
export default class PlayerSettings {
  constructor(volume, mute) {
    this.volume = volume;
    this.mute = mute;
  }

  setVolume(vol) {
    return new PlayerSettings(vol, this.mute);
  }

  setMute(mute) {
    return new PlayerSettings(this.volume, mute);
  }
}
