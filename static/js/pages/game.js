import { Page } from '../core/Page.js';

export class GamePage extends Page {
  constructor() {
    super('game.html', 'game.css');
  }

  onMount() {
    console.log('Game Page mounted');
  }
}
