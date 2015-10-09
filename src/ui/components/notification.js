
import React from 'react';
import _ from 'lodash';

const noteLifeTime = 5000;

export default React.createClass({
  getInitialState() {
    return { notifications: [] };
  },

  componentWillReceiveProps(newProps) {
    return this.updateNotes(newProps.notifications);
  },

  render() {
    const content = _.map(this.state.notifications, function(note) {
      return (<span
          className="b-notification__item"
          key={note.timestamp}
        >
        {note.text}
      </span>);
    });

    return (<div className="b-notification">
      {content}
    </div>);
  },

  updateNotes(incomingNotes) {
    const notes = (
      incomingNotes || this.state.notifications
    ).filter(function(note) {
      return (Date.now() + note.timestamp) < noteLifeTime;
    });

    this.setState({
      notifications: notes,
    });

    if (!notes.length) {
      return;
    }

    setTimeout(
      this.updateNotes,
      notes[notes.length - 1].timestamp - Date.now() + noteLifeTime
    );
  },
});
