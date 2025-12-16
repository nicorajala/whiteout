import './style.css';
import { Game } from './core/Game.js';

// Initialize the game when the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.start();
});
