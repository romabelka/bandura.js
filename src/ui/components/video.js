
import React from 'react';

export default React.createClass({
  displayName: 'video',

  render() {
    if (this.props.showVideo) {
      return (
        <div className="b-video--item video_active">
          <div className="b-video--popup">
            <div className="b-video--popup--height">
            </div>
            <div className="b-video--popup--wrapper">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${this.props.video.id.videoId}`}
                frameBorder="0"
                allowFullScreen />
            </div>
          </div>
          <div className="b-video--wrapper">
            <div className="b-video--picture">
              <img src={this.props.video.snippet.thumbnails.default.url}/>
            </div>
            <div className="b-video--title">{this.props.video.snippet.title}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="b-video--item" onClick={this.handleClick}>
        <div className="b-video--wrapper">
          <div className="b-video--picture">
            <img src={this.props.video.snippet.thumbnails.default.url}/>
          </div>
          <div className="b-video--title">{this.props.video.snippet.title}</div>
        </div>
      </div>
    );
  },

  handleClick() {
    return this.props.onClick(this.props.video);
  },
});
