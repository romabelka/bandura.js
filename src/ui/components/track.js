
import React from 'react';

import { controls, collections } from '../../dispatcher/api';

export default React.createClass({
  displayName: 'Track',

  render() {
    let className = 'b-track';

    const actionIconClass = this.props.isPlaying ?
      'b-icon__pause' : 'b-icon__play';

    const cssImage = this.props.track.cover ?
      { backgroundImage: `url(${this.props.track.cover})` } : {};

    const action = this.props.isActive ?
      this.props.isPlaying ? this.pause : this.resume
    : this.play;

    if (this.props.isPlaying) {
      className += ' b-track__playing';
    }

    if (this.props.isActive) {
      className += ' b-track__active';
    }

    return (
      <div className={className} onClick={action}>
        <i className="b-icon b-icon__cancel" onClick={this.removeTrackFromPlaylist}></i>
        <div className="b-track__cover">
          <div className="b-track__cover__blur b-track__cover-default-image" style={cssImage}></div>
          <div className="b-track__cover__circle  b-track__cover-default-image" style={cssImage}></div>
          <div className="b-track__cover__btn-action">
            <i className={'b-icon ' + actionIconClass}></i>
            <div className="b-track__cover__blur-circle b-track__cover-default-image" style={cssImage}></div>
          </div>
        </div>
        <div className="b-track__text b-track__text_artist">{this.props.track.artist}</div>
        <div className="b-track__text b-track__text_name">{this.props.track.name}</div>
      </div>
    );
  },

  play() {
    controls.push({ action: 'stop' });

    collections.push({
      action: 'updateActive',
      playlist: this.props.playlist.changeTrack(this.props.index),
    });


    return controls.push({ action: 'play' });
  },

  pause() {
    return controls.push({ action: 'pause' });
  },

  resume() {
    return controls.push({ action: 'play' });
  },

  removeTrackFromPlaylist(e) {
    e.stopPropagation();

    return collections.push({
      action: 'removeTrack',
      arguments: [this.props.playlist, this.props.track],
    });
  },
});
