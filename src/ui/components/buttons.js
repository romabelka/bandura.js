
import React from 'react';
import _ from 'lodash';

import { notify } from '../../dispatcher/api';

export default React.createClass({
  render() {
    const buttons = _.map(this.props.enabledButtons, function(btn) {
      return (<li
        className={'b-btn ' + btn.liClass + ' b-tooltip'}
        onClick={this.handleClick(btn)}
        key={btn.name}
        data-tooltip={btn.tooltip}
      >
        <i className={'b-icon ' + btn.iconClass}></i>
      </li>);
    }, this);

    return (
      <ol
        className = "b-player--buttons"
        ref="tooltip"
        onClick = {this.clickme}
      >
        {buttons}
      </ol>
    );
  },

  handleClick(btn) {
    return () => {
      try {
        btn.callback.apply(this, arguments);
      } catch (e) {
        notify.push(e.message);
      }
    };
  },
});
