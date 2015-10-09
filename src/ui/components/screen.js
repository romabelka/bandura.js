
import React from 'react';
import _ from 'lodash';

import Video from './video';
import { controls } from '../../dispatcher/api';

export default React.createClass({
  displayName: 'screen',

  getInitialState() {
    return { visibleVideo: false };
  },

  render() {
    if (!this.props.videos || !this.props.visible) {
      return (<div></div>);
    }

    const videoItems = _.map(this.rops.videos, function(video) {
      return (<Video
        video={video}
        key={video.id}
        onClick={this.clickVideo}
        showVideo={video === this.state.visibleVideo}/>
      );
    }, this);

    return (
      <div className="b-video--background" onClick={this.props.closeScreen}>
        <div className="b-video" onClick={this.preventBubbling}>
            <span className="b-video--close" onClick={this.props.closeScreen}>&times;</span>
            {videoItems}
        </div>
      </div>
    );
  },

  clickVideo(video) {
    controls.push({ action: 'pause' });

    return this.setState({ visibleVideo: video });
  },

  preventBubbling(e) {
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
  },
});
