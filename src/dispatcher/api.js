
import Bacon from 'bacon';

export default {
  controls: new Bacon.Bus(),
  progress: new Bacon.Bus(),
  collections: new Bacon.Bus(),
  settingsChanges: new Bacon.Bus(),
  videos: new Bacon.Bus(),
  buttons: new Bacon.Bus(),
  soundEvents: new Bacon.Bus(),
  notify: new Bacon.Bus(),
};
