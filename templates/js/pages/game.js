import { Page } from '../core/Page.js';
import { windowManager } from '../components/windowManager.js';

export class GamePage extends Page {
  constructor() {
    super('game.html');
  }

  async mount() { //Faudra linker le html mais l'enfer pour l'instant j'écris en brut
    const content = `
      <h2>Jeu Pong</h2>
      <canvas id="pongCanvas" width="800" height="600"></canvas>
    `;

    windowManager.openWindow('Jeu Pong', content);
    return true;
  }
}
