import { Game } from '../core/Game';
import { ProgressionManager } from '../progression/ProgressionManager';

export interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

export class AcceptanceTestRunner {
  public static async runAllTests(game: Game): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const ui = game.getUIManager();
    const boat = game.getBoat();

    const assert = (condition: any, name: string, details?: string) => {
      const passed = Boolean(condition);
      results.push({
        name,
        passed,
        details: passed ? undefined : (details || 'Assertion failed')
      });
      console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}${passed ? '' : ` (${details})`}`);
    };

    console.log('====================================================');
    console.log('LITTLE PAPER BOAT — UI & GAMEPLAY ACCEPTANCE TESTS');
    console.log('====================================================');

    // ----------------------------------------------------
    // Scenario 1: First game launch
    // ----------------------------------------------------
    assert(game.getState() === 'MAIN_MENU', '1. Initial state is MAIN_MENU');
    const mainMenuEl = document.getElementById('screen-main-menu');
    assert(mainMenuEl !== null && !mainMenuEl.classList.contains('hidden'), '1. Main menu screen is visible');
    const modalLayer = document.getElementById('modal-layer');
    assert(modalLayer !== null && modalLayer.classList.contains('hidden'), '1. Modal layer is hidden on launch');
    assert(ui.getActiveModal() === 'NONE', '1. No modal is active on launch');
    const joystick = document.getElementById('virtual-joystick-container');
    assert(joystick !== null && (joystick.style.display === 'none' || !boat.isMovementEnabled()), '1. Joystick is not active on launch');

    // ----------------------------------------------------
    // Scenario 2: Open and close tutorial from menu
    // ----------------------------------------------------
    document.getElementById('btn-how')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'TUTORIAL', '2. Tutorial modal is active after clicking How to Sail');
    const tutorialCard = document.getElementById('modal-card-tutorial');
    const aboutCard = document.getElementById('modal-card-about');
    assert(!tutorialCard?.classList.contains('hidden'), '2. Tutorial card is visible');
    assert(aboutCard?.classList.contains('hidden'), '2. About card is hidden (no overlap)');
    assert(!modalLayer?.classList.contains('hidden'), '2. Modal layer is visible');

    // Click understood
    document.getElementById('btn-tutorial-understood')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'NONE', '2. Tutorial modal is dismissed');
    assert(modalLayer?.classList.contains('hidden'), '2. Modal layer is hidden after dismissing tutorial');

    // ----------------------------------------------------
    // Scenario 3: Open and close About dialog
    // ----------------------------------------------------
    document.getElementById('btn-about')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'ABOUT', '3. About modal is active after clicking About');
    assert(!aboutCard?.classList.contains('hidden'), '3. About card is visible');
    assert(tutorialCard?.classList.contains('hidden'), '3. Tutorial card is hidden underneath');
    const aboutText = aboutCard?.innerText || '';
    assert(aboutText.includes('Little Paper Boat'), '3. About card contains game title');
    assert(aboutText.includes('Engine: PlayCanvas 3D'), '3. About card specifies Engine: PlayCanvas 3D');
    assert(aboutText.includes('A cozy adventure about peaceful exploration'), '3. About card contains storybook description');

    // Click close about
    document.getElementById('btn-close-about')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'NONE', '3. About modal is closed');
    assert(modalLayer?.classList.contains('hidden'), '3. Modal layer is hidden');

    // ----------------------------------------------------
    // Scenario 4: Open Settings
    // ----------------------------------------------------
    document.getElementById('btn-settings')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'SETTINGS', '4. Settings modal is active');
    const settingsCard = document.getElementById('modal-card-settings');
    assert(!settingsCard?.classList.contains('hidden'), '4. Settings card is visible');
    assert(aboutCard?.classList.contains('hidden'), '4. About card is hidden');
    document.getElementById('btn-close-settings')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'NONE', '4. Settings modal closed');

    // ----------------------------------------------------
    // Scenario 5 & 6: Level Selection, First-time Tutorial, and Start Gameplay
    // ----------------------------------------------------
    // Reset tutorial state to verify first-time tutorial flow
    ProgressionManager.resetTutorial();
    assert(!ProgressionManager.hasSeenTutorial(), '5. Tutorial completion reset for test');

    document.getElementById('btn-levels')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(game.getState() === 'LEVEL_SELECTION', '5. Transitioned to LEVEL_SELECTION state');
    const levelSelectEl = document.getElementById('screen-level-select');
    assert(!levelSelectEl?.classList.contains('hidden'), '5. Level select screen is visible');

    // Click Level 1 to start
    game.startLevel(1);
    await new Promise(r => setTimeout(r, 50));
    assert(game.getState() === 'TUTORIAL', '6. First-time play triggers TUTORIAL state');
    assert(ui.getActiveModal() === 'TUTORIAL', '6. Tutorial modal is active');
    assert(!boat.isMovementEnabled(), '6. Boat movement is disabled during tutorial');
    assert(aboutCard?.classList.contains('hidden'), '6. About dialog is NOT open during tutorial');

    // Click understood to start sailing
    document.getElementById('btn-tutorial-understood')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(game.getState() === 'PLAYING', '6. Game state transitions to PLAYING after tutorial dismissal');
    assert(ui.getActiveModal() === 'NONE', '6. Modals are closed');
    assert(boat.isMovementEnabled(), '6. Boat movement is enabled');
    assert(ProgressionManager.hasSeenTutorial(), '6. Tutorial marked as seen in persistent storage');

    // ----------------------------------------------------
    // Scenario 7: Pause and resume
    // ----------------------------------------------------
    document.getElementById('btn-pause')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'PAUSE', '7. Pause modal opens when pause button clicked');
    assert(!boat.isMovementEnabled(), '7. Boat movement is disabled while paused');

    document.getElementById('btn-resume')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(game.getState() === 'PLAYING', '7. Game state returns to PLAYING on resume');
    assert(ui.getActiveModal() === 'NONE', '7. Pause modal closed');
    assert(boat.isMovementEnabled(), '7. Boat movement restored');

    // ----------------------------------------------------
    // Scenario 8: Restart current level (Tutorial must not reappear)
    // ----------------------------------------------------
    document.getElementById('btn-pause')?.click();
    await new Promise(r => setTimeout(r, 50));
    document.getElementById('btn-restart')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(game.getState() === 'PLAYING', '8. Level restarts directly into PLAYING without repeating tutorial');
    assert(ui.getActiveModal() === 'NONE', '8. No modal active on level restart');
    assert(boat.isMovementEnabled(), '8. Boat movement immediately active');

    // ----------------------------------------------------
    // Scenario 9: Complete a level
    // ----------------------------------------------------
    game.completeLevel(1, 10, 10);
    await new Promise(r => setTimeout(r, 50));
    assert(ui.getActiveModal() === 'LEVEL_COMPLETE', '9. Result modal is active upon completion');
    const resultCard = document.getElementById('modal-card-level-complete');
    assert(!resultCard?.classList.contains('hidden'), '9. Result card is visible');
    const starsEl = document.getElementById('result-stars');
    assert(starsEl?.textContent?.includes('⭐⭐⭐'), '9. Three stars displayed on 10/10 collectibles');

    // ----------------------------------------------------
    // Scenario 10: Return to level selection
    // ----------------------------------------------------
    document.getElementById('btn-result-levels')?.click();
    await new Promise(r => setTimeout(r, 50));
    assert(game.getState() === 'LEVEL_SELECTION', '10. Return to LEVEL_SELECTION state from result modal');
    assert(ui.getActiveModal() === 'NONE', '10. Modals closed when in level selection');

    // ----------------------------------------------------
    // Scenario 11 & 12: Persistent storage and reload verification
    // ----------------------------------------------------
    assert(ProgressionManager.hasSeenTutorial(), '11. Tutorial seen flag is persisted in localStorage');
    const level1Record = ProgressionManager.getLevelRecord(1);
    assert(level1Record.completed, '11. Level 1 completion status persisted');
    const level2Record = ProgressionManager.getLevelRecord(2);
    assert(level2Record.unlocked, '11. Level 2 sequentially unlocked');

    // Re-init progression to simulate browser reload
    ProgressionManager.init();
    assert(ProgressionManager.hasSeenTutorial(), '12. Tutorial seen persists across ProgressionManager.init() reloads');

    // Check no stacked modal backdrops exist
    const modalLayers = document.querySelectorAll('.modal-layer');
    assert(modalLayers.length === 1, '12. Exactly ONE centralized modal-layer exists in the DOM (no multiple stacked overlays)');

    const passedCount = results.filter(r => r.passed).length;
    console.log('====================================================');
    console.log(`ACCEPTANCE TEST RESULTS: ${passedCount}/${results.length} PASSED`);
    console.log('====================================================');

    return results;
  }
}
