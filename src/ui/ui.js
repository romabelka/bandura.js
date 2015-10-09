
import React from 'react';

import UIPlayer from './components/player';
import Volume from './components/volume';
import Progressbar from './components/progress';

export default function() {
  const container = document.body.appendChild(document.createElement('div'));

  const components = {
    player: <UIPlayer playingStatus={this.playingStatus} buttons={[]}/>,
    progress: <Progressbar />,
    volume: <Volume />,
  };

  React.render(components.player, container, () => {
    React.render(
      components.progress,
      document.getElementById('bandura-progressbar-section')
    );

    React.render(
      components.volume,
      document.getElementById('bandura-volume-section')
    );
  });

  return components;
}
