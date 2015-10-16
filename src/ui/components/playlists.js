
import React from 'react';
import _ from 'lodash';

import Playlist from './playlist';
import { collections } from '../../dispatcher/api';

export default React.createClass({
  displayName: 'Playlists',

  getInitialState() {
    return {
      visiblePlaylist: void 0,
      showLeftScroll: false,
      showRightScroll: false,
      position: 0,
      scrolling: null,
      elWidth: null,
      screenWidth: null,
    };
  },

  componentWillReceiveProps() {
    const PLColl = this.props.PLCollection;

    if ((PLColl ? PLColl.getAllPlaylists().length : 0) < 3) {
      return;
    }

    if (!this.state.screenWidth) {
      return;
    }

    this.setState({
      showRightScroll: this.state.screenWidth <= (PLColl ? PLColl.getAllPlaylists().length : 0) * this.state.elWidth,
    });
  },

  componentDidUpdate() {
    if (this.state.screenWidth || !this.props.visible) {
      return;
    }

    const screenWidth = this.refs.playlists.getDOMNode().getBoundingClientRect().width;
    const itemWidth = this.refs.playlists.getDOMNode().children[0].children[0].getBoundingClientRect().width + 5;


    this.setState({
      screenWidth: screenWidth,
      elWidth: itemWidth,
      showRightScroll: screenWidth <= (
        this.props.PLCollection ?
          this.props.PLCollection.getAllPlaylists().length : 0
      ) * itemWidth,
    });
  },

  getVisiblePlaylist() {
    if (this.props.PLCollection) {
      if (this.state.visiblePlaylistId) {
        return this.props.PLCollection.getPlaylistById(this.state.visiblePlaylistId);
      }

      return this.props.PLCollection.getActivePlaylist();
    }

    return null;
  },

  render() {
    if (!this.props.visible) {
      return false;
    }

    const iteratedPls = this.props.PLCollection || [];
    const activePlaylist = iteratedPls.getActivePlaylist ?
      iteratedPls.getActivePlaylist() : null;

    const visiblePlaylist = this.getVisiblePlaylist();

    const isActive = activePlaylist && visiblePlaylist ?
      activePlaylist.getId() === visiblePlaylist.getId() : false;

    const isPlaying = isActive && this.props.isPlaying === 'isPlaying';

    const playlists = _.map(
      iteratedPls.getAllPlaylists ? iteratedPls.getAllPlaylists() : [],
      (pl) => {
        let className = 'b-playlists--menu--item';

        if (activePlaylist && pl.getId() === activePlaylist.getId()) {
          className += ' b-playlists--menu--item__active';
        }

        if (this.state.visiblePlaylistId) {
          if (pl.getId() === this.state.visiblePlaylistId) {
            className += ' b-playlists--menu--item__selected';
          }
        }

        return (
          <li
            onClick={this.showPlaylist(pl.getId())}
            className={className}
            key={pl.getId()}
            >
            <i
              onClick={this.removePlaylist(pl)}
              className="b-icon b-icon__cancel"></i>
            {pl.getName()}
          </li>
        );
      }, this);

    const leftScroll = !this.state.showLeftScroll ? null : (
      <div className="b-playlists--scroll b-playlists--scroll__back"
        onMouseEnter={this.scrollLeft}
        onMouseUp={this.finishScrolling}
        onMouseLeave={this.finishScrolling}>
        <i className="b-icon b-icon__left-open b-playlist--icon" />
      </div>
    );

    const rightScroll = !this.state.showRightScroll ? null : (
      <div className="b-playlists--scroll b-playlists--scroll__forward"
        onMouseEnter={this.scrollRight}
        onMouseUp={this.finishScrolling}
        onMouseLeave={this.finishScrolling}  >
        <i className="b-icon b-icon__right-open b-playlist--icon" />
      </div>
    );

    return (
      <div className="b-playlists" ref="playlists">
        {leftScroll}
        {rightScroll}
        <ul className="b-playlists--menu" style={{left: this.state.position}}>
          {playlists}
        </ul>
        <Playlist playlist={visiblePlaylist} isPlaying={isPlaying} isActive={isActive}/>
      </div>
    );
  },

  removePlaylist(pl) {
    return () => {
      return collections.push({
        action: 'removePlaylist',
        playlist: pl,
      });
    };
  },

  showPlaylist(id) {
    return () => {
      return this.setState({
        visiblePlaylistId: id,
      });
    };
  },

  scrollLeft() {
    this.setState({
      showRightScroll: true,
    });

    return this.setState({
      scrolling: setInterval(() => {
        if (this.state.position >= 0) {
          this.finishScrolling();
          this.setState({
            showLeftScroll: false,
          });
        }
        return this.setState({
          position: this.state.position + 45,
        });
      }, 50),
    });
  },

  scrollRight() {
    this.setState({
      showLeftScroll: true,
    });

    return this.setState({
      scrolling: setInterval(() => {
        if (this.state.position <= this.state.screenWidth - this.props.PLCollection.getAllPlaylists().length * this.state.elWidth) {
          this.finishScrolling();
          this.setState({
            showRightScroll: false,
          });
          return;
        }

        this.setState({
          position: this.state.position - 45,
        });
      }, 50),
    });
  },

  finishScrolling() {
    if (this.state.scrolling !== null) {
      clearInterval(this.state.scrolling);
    }
  },
});
