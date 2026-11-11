import './ui/styles.css';
import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  (window as any).__game = game;
  console.log('Little Paper Boat initialized successfully!');
});
