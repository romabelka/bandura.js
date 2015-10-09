
import React from 'react';
import _ from 'lodash';

import Track from './track';
import { collections } from '../../dispatcher/api';

const defaultTrackWidth = 127;

export default React.createClass({
  displayName: 'Playlist',
  getInitialState() {
    return {
      showLeftScroll: false,
      showRightScroll: false,
      position: 0,
      scrolling: null,
    };
  },

  componentDidMount() {
    const ref = this.props.playlist;
    const tracks = ref !== null ? ref.getTracks() : void 0;

    if (!tracks) {
      return;
    }

    const width = this.refs.playlist.getDOMNode().getBoundingClientRect().width;

    /* Sorry guys */
    this.setState({
      showRightScroll: width < tracks.length * defaultTrackWidth,
    });
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.playlist === null) {
      return;
    }

    const ref = this.props.playlist;
    const changedPlaylist = (ref !== null ? ref.getId() : void 0) !== nextProps.playlist.getId();

    if (changedPlaylist) {
      this.setState({
        position: 0,
        showLeftScroll: false,
      });
    }

    this.setState({
      showRightScroll: this.state.position >= this.refs.playlist.getDOMNode().getBoundingClientRect().width - nextProps.playlist.getTracks().length * defaultTrackWidth,
    });
  },

  render() {
    let leftScroll;
    let rightScroll;
    let tracks;

    if (this.props.playlist === null) {
      return <div className="b-playlist" ref="playlist" />;
    }

    tracks = _.map(this.props.playlist.getTracks(), (track, index) => {
      const isActive = this.props.isActive && index === this.props.playlist.getActiveTrackIndex();
      const isPlaying = isActive && this.props.isPlaying;

      return (
        <li key={index} className="b-playlist--tracks-item">
          <Track
            playlist={this.props.playlist}
            track={track}
            index={index}
            isPlaying={isPlaying}
            isActive={isActive}
            key={index}/>
        </li>
      );
    });

    if (this.state.showLeftScroll) {
      leftScroll = (
        <div className="b-playlist--scroll b-playlist--scroll__back"
          onMouseEnter={this.scrollLeft}
          onMouseUp={this.finishScrolling}
          onMouseLeave={this.finishScrolling}>
          <i className="b-icon b-icon__left-open" />
        </div>
      );
    }

    if (this.state.showRightScroll) {
      rightScroll = (
        <div className="b-playlist--scroll b-playlist--scroll__forward"
          onMouseEnter={this.scrollRight}
          onMouseUp={this.finishScrolling}
          onMouseLeave={this.finishScrolling}
        >
          <i className="b-icon b-icon__right-open" />
        </div>
      );
    }

    return (
      <div className="b-playlist" onDrop={this.drop} onDragOver={this.dragOver} ref="playlist">
        {leftScroll}
        {rightScroll}
        <ul className="b-playlist--tracks" style={{left: this.state.position}}>
          {tracks}
        </ul>
      </div>
    );
  },

  drop(ev) {
    ev.preventDefault();

    return collections.push({
      action: 'update',
      playlist: this.props.playlist.addTrack(JSON.parse(ev.dataTransfer.getData('track'))),
    });
  },

  dragOver(ev) {
    return ev.preventDefault();
  },

  scrollLeft() {
    this.setState({
      showRightScroll: true,
    });

    return this.setState({
      scrolling: setInterval(() => {
        return () => {
          if (this.state.position >= 0) {
            this.finishScrolling();
            this.setState({
              showLeftScroll: false,
            });
          }

          return this.setState({
            position: this.state.position + 45,
          });
        };
      }, 50),
    });
  },

  scrollRight() {
    this.setState({
      showLeftScroll: true,
    });

    return this.setState({
      scrolling: setInterval(() => {
        return () => {
          if (this.state.position <= this.refs.playlist.getDOMNode().getBoundingClientRect().width - this.props.playlist.getTracks().length * defaultTrackWidth) {
            this.finishScrolling();
            this.setState({
              showRightScroll: false,
            });
            return;
          }

          this.setState({
            position: this.state.position - 45,
          });
        };
      }, 50),
    });
  },
  finishScrolling() {
    if (this.state.scrolling !== null) {
      return clearInterval(this.state.scrolling);
    }
  },
});
