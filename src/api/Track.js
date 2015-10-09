
import Utils from '../utils';

export default class Track {
  defaults: {
    artist: 'unknown artist',
    name: 'unknown track'
  }

  constructor(options) {
    return Utils.extend(this, this.defaults, options);
  }

  get(param) {
    return this[param];
  }
}
