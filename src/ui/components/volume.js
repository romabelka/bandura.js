
import React from 'react';

import { settingsChanges } from '../../dispatcher/api';

export default React.createClass({
  getInitialState() {
    return { drag: false };
  },

  render() {
    const muteIcon = this.props.mute ?
      'b-icon__volume-off-1' : 'b-icon__volume';

    return (
      <div
        className="b-volume"
        onMouseDown={this.mouseDown}
        onMouseMove={this.mouseMove}
        onMouseUp={this.cancelDrag}
        onMouseLeave={this.cancelDrag}
      >
        <span className="b-btn b-tooltip" data-tooltip="Mute volume">
          <i
            className= {`b-icon b-icon__mute ${muteIcon}`}
            onClick={this.mute}>
          </i>
        </span>
        <div className="b-volume--container" ref="container">
          <div className="b-volume--draggable">
            <i
              className="b-icon b-icon__record b-draggable"
              style={{top: - 26, left: this.props.volume / 2 - 5}}>
            </i>
          </div>
        </div>
      </div>
    );
  },

  cancelDrag() {
    this.setState({ drag: false });
  },

  changeVolume(e, refs) {
    return settingsChanges.push({
      volume: (
        e.clientX - refs.container
          .getDOMNode().getBoundingClientRect().left
      ) * 2,
    });
  },

  mouseMove(e) {
    if (!this.state.drag) {
      return;
    }

    this.changeVolume(e, this.refs);
  },

  mouseDown(e) {
    this.setState({ drag: true });

    this.changeVolume(e, this.refs);
  },

  handleDrag(e, ui) {
    settingsChanges.push({volume: ui.position.left * 2});
  },

  mute() {
    settingsChanges.push({ mute: !this.props.mute });
  },
});
