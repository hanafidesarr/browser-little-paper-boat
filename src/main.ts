import { Game } from './core/Game';
import { LevelValidator } from './levels/LevelValidator';
import { AcceptanceTestRunner } from './test/AcceptanceTestRunner';
import './ui/styles.css';

window.addEventListener('DOMContentLoaded', async () => {
  const game = new Game();
  (window as any).__gameInstance = game;
  (window as any).runAcceptanceTests = () => AcceptanceTestRunner.runAllTests(game);

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

  // Acceptance test runner via URL query param
  if (window.location.search.includes('run_tests=1')) {
    setTimeout(async () => {
      const results = await AcceptanceTestRunner.runAllTests(game);
      (window as any).__testResults = results;
    }, 500);
    return;
  }

  // URL parameter routing for testing & visual verification
  if (window.location.search.includes('modal=settings')) {
    setTimeout(() => {
      document.getElementById('btn-settings')?.click();
    }, 250);
  } else if (window.location.search.includes('modal=about')) {
    setTimeout(() => {
      document.getElementById('btn-about')?.click();
    }, 250);
  } else if (window.location.search.includes('modal=tutorial')) {
    setTimeout(() => {
      document.getElementById('btn-how')?.click();
    }, 250);
  } else if (window.location.search.includes('play=1')) {
    setTimeout(() => {
      game.startLevel(1);
      setTimeout(() => {
        document.getElementById('btn-tutorial-understood')?.click();
      }, 100);
    }, 200);
  } else if (window.location.search.includes('screen=level_select')) {
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
