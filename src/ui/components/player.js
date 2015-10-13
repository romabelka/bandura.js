
import React from 'react';

import { controls } from '../../dispatcher/api';

import Playlists from './playlists';
import Notification from './notification';
import Buttons from './buttons';

import Screen from './screen';

const btnClasses = 'b-btn b-controls--button  b-tooltip';

export default React.createClass({
  displayName: 'Player',

  getInitialState() {
    return {
      showPlaylists: false,
      videoScreen: false,
      playingStatus: false,
    };
  },

  render() {
    const playClass = this.props.playingStatus ===
      'isPlaying' ? 'b-icon__pause' : 'b-icon__play';

    const activePlaylist = this.props.PLCollection ?
      this.props.PLCollection.getActivePlaylist() : null;

    const currentTrack = activePlaylist ?
      activePlaylist.getActiveTrack() : null;

    const canPlay = !!currentTrack;

    const hasNext = activePlaylist ? activePlaylist.hasNext() : null;
    const hasPrev = activePlaylist ? activePlaylist.hasPrevious() : null;

    return (
      <div className="b-bandura">
        <div className="b-player">
          <div className="b-player--section">
            <div className="b-controls">
              <div
                className={hasPrev ? btnClasses : btnClasses + ' disabled'}
                onClick={hasPrev ? this.prevTrack : null}
                data-tooltip="Previous track">
                <i className="b-icon b-icon__fast-backward-1"></i>
              </div>
              <div
                className={canPlay ? btnClasses : btnClasses + ' disabled'}
                onClick={canPlay ? this.playAction : null}
                data-tooltip="Play/Pause">
                <i className={'b-icon ' + playClass}></i>
              </div>
              <div
                className={hasNext ? btnClasses : btnClasses + ' disabled'}
                onClick={hasNext ? this.nextTrack : null}
                data-tooltip="Next Track">
                <i className="b-icon b-icon__fast-forward-1"></i>
              </div>
            </div>
          </div>
          <div className="b-player--section" id="bandura-progressbar-section" />
          <div className="b-player--section" id="bandura-volume-section" />
          <div className="b-player--section">
            <Buttons enabledButtons={this.props.buttons} />
          </div>
        </div>
        <Notification notifications = {this.props.notifications}/>
        <Playlists PLCollection={this.props.PLCollection} isPlaying={this.props.playingStatus} visible={this.state.showPlaylists}/>
        <Screen videos = {this.props.videos} visible={this.state.videoScreen} closeScreen={this.closeVideoScreen} />
      </div>
    );
  },

  prevTrack() {
    return controls.push({
      action: 'previousTrack',
    });
  },

  nextTrack() {
    return controls.push({
      action: 'nextTrack',
    });
  },

  playAction() {
    switch (this.props.playingStatus) {
    case 'isPlaying':
      return controls.push({
        action: 'pause',
      });
    case 'Paused':
      return controls.push({
        action: 'play',
      });
    case 'Stoped':
      return controls.push({
        action: 'play',
      });
    default: null;
    }
  },

  closeVideoScreen(e) {
    e.preventDefault();

    return this.setState({
      videoScreen: false,
    });
  },
});
