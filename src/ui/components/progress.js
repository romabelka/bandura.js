
import React from 'react';

import { controls } from '../../dispatcher/api';

const width = 500;

export default React.createClass({
  displayName: 'Progress',

  render() {
    const currentTrack = this.props.currentTrack;
    let trackInfo = (<small className="b-progressbar--track--info">Nothing is playing right now</small>);
    let showTime = '';
    let loaded = 0;
    let progress;

    if (this.props.position && currentTrack) {
      trackInfo = (<small className="b-progressbar--track--info">
        <span className="b-progressbar--track--info-name">
          {currentTrack.name}
        </span>
        <span className="b-progressbar--track--info-delimiter"> : </span>
        <span className="b-progressbar--track--info-artist">
          {currentTrack.artist}
        </span>
      </small>);

      const trackTime = {
        min: Math.floor(this.props.duration / 60000),
        max: Math.floor((this.props.duration - Math.floor(this.props.duration / 60000) * 60000) / 1000),
        posMin: Math.floor(this.props.position / 60000),
        posSec: Math.floor((this.props.position - Math.floor(this.props.position / 60000) * 60000) / 1000),
      };

      showTime = `${trackTime.posMin}:${trackTime.posSec} / ${trackTime.min}:${trackTime.max}`;
      progress = this.props.position / this.props.duration;
      loaded = this.props.loaded;
    }

    return (
      <div className="b-progressbar--wrapper">
        {trackInfo}
        <small className="b-progressbar--track--time">{showTime}</small>
        <div className="b-progressbar" style={{ width: width }}>
          <div className="b-progressbar--container" onClick = {this.setPosition}>
          <div className="b-progressbar--loaded" style={{width: loaded ? loaded * width : 0}}></div>
             <div className="b-draggable b-progressbar--drag" style={{top: -6, left: progress ? progress * width : 0}}></div>
          </div>
        </div>
      </div>
    );
  },

  setPosition(e) {
    controls.push({
      action: 'setPosition',
      percent: (e.clientX - e.currentTarget.getBoundingClientRect().left) / width,
    });
  },
});
