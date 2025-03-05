import { Page } from '../core/Page.js';

export class GamePage extends Page {
  constructor() {
    super('game.html', 'game.css');
  }

  async createGame() {
    try {
      const response = await fetch('/api/game/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }

      const gameData = await response.json();
      console.log('Game created:', gameData);

      this.initializeGameSocket(gameData.game_id);

      return gameData;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  initializeGameSocket(gameId) {
    // Initialize WebSocket connection for the game
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${gameId}`);

    ws.onopen = () => {
      console.log('WebSocket connected for game:', gameId);
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      console.log('Received game update:', data);
      // Handle game updates
    };

    return ws;
  }

  onMount() {
    console.log('Game page mounted');
    const startGame = document.getElementById('start-game');
    const joinGame = document.getElementById('join-game');
    
    joinGame.addEventListener('click', async e =>{
      
    })
    
    startGame.addEventListener('click', async e => {
      try {
        const gameData = await this.createGame();
        // Update UI to show game started
        // document.getElementById('pregame-menu').style.display = 'none';
        // document.getElementById('game-container').style.display = 'block';
      } catch (error) {
        console.error('Failed to start game:', error);
        // Show error message to user
      }
    });
  }
}
