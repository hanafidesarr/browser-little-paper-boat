import { Game } from './core/Game';
import './ui/styles.css';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  // If URL has autostart parameter (e.g. for testing / screenshots)
  if (window.location.search.includes('autostart=1')) {
    setTimeout(() => {
      const playBtn = document.getElementById('btn-play');
      if (playBtn) {
        playBtn.click();
      }
    }, 250);
  }

  console.log('⛵ Little Paper Boat — Initialized with modular gameplay systems.');
});
