import { Game } from './core/Game';
import { LevelValidator } from './levels/LevelValidator';
import './ui/styles.css';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  const validationResults = LevelValidator.validateAllLevels();
  console.log('=== LEVEL VALIDATION REPORT ===');
  console.table(validationResults.map(r => ({
    Level: r.levelId,
    Title: r.title,
    Length: `${r.totalLength.toFixed(1)}m`,
    Obstacles: r.obstaclesCount,
    Collectibles: r.collectiblesCount,
    Status: r.passed ? 'PASSED ✅' : 'FAILED ❌'
  })));
  
  const allPassed = validationResults.every(r => r.passed);
  console.log(`[Validation Summary] 10/10 Levels Validated: ${allPassed ? 'ALL PASSED' : 'ERRORS DETECTED'}`);

  // URL parameter routing for testing & visual verification
  if (window.location.search.includes('screen=level_select')) {
    setTimeout(() => {
      game.getUIManager().showLevelSelect();
    }, 150);
  } else if (window.location.search.includes('level=')) {
    const match = window.location.search.match(/level=(\d+)/);
    const levelId = match ? parseInt(match[1]) : 1;
    setTimeout(() => {
      game.startLevel(levelId);
    }, 150);
  } else if (window.location.search.includes('autostart=1')) {
    setTimeout(() => {
      const playBtn = document.getElementById('btn-play');
      if (playBtn) {
        playBtn.click();
      }
    }, 250);
  }

  console.log('⛵ Little Paper Boat — Initialized with modular gameplay systems.');
});
