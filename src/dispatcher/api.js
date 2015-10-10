
import Bacon from 'baconjs';

const controls = new Bacon.Bus();
const progress = new Bacon.Bus();
const collections = new Bacon.Bus();
const settingsChanges = new Bacon.Bus();
const videos = new Bacon.Bus();
const buttons = new Bacon.Bus();
const soundEvents = new Bacon.Bus();
const notify = new Bacon.Bus();

export {
  controls, progress, collections, settingsChanges,
  videos, buttons, soundEvents, notify
};

export default {
  controls,
  progress,
  collections,
  settingsChanges,
  videos,
  buttons,
  soundEvents,
  notify,
};
