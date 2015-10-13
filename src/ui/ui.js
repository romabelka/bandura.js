
import React from 'react';

import UIPlayer from './components/player';
import Volume from './components/volume';
import Progressbar from './components/progress';

export default function() {
  const container = document.body.appendChild(document.createElement('div'));

  const components = {};

  components.player = React.render(<UIPlayer buttons={[]}/>, container, () => {
    components.progressbar = React.render(
      <Progressbar />,
      document.getElementById('bandura-progressbar-section')
    );

    components.volume = React.render(
      <Volume volume={45} />,
      document.getElementById('bandura-volume-section')
    );
  });

  return components;
}
