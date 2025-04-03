import { Page } from '../core/Page.js';
import { GameManager } from './gameManager.js';
import { setupSliders, Player, movePlayer, stopPlayer, ball, updatePos, checkXCollision, updateScore, Game, pregame, animate, initGame, startGameLoop} from '../components/game.js';
import { pregameSetup, stopPregameAnimations} from './pregame.js'; 

export class GamePage extends Page {
  constructor() {
    super('game.html', 'game.css');
    this.gameManager = new GameManager();
    this.gameId = null;
    this.gameInstance = null; // Store the game instance here
    this.waitingForPlayer = false;
    // Default game settings
    this.gameSettings = {
      ballSpeed: 0.1,
      paddleSize: 3,
      paddleSpeed: 0.3,
      winScore: 5
    };
  }

  onMount() {
    console.log('Game page mounted');
    const startGame = document.getElementById('start-game');
    const joinGameButton = document.getElementById('join-game');    
 
    setupSliders();
    
    pregame();
    pregameSetup();
    // Écouter les mises à jour du jeu
    document.addEventListener('game-update', event => {
      this.handleGameUpdate(event.detail);
    });

    joinGameButton.addEventListener('click', async e => {
      const gameIDInput = document.getElementById('game-id-input');
      if (!gameIDInput) {
        console.error('Game ID input not found in the DOM');
        return;
      }

      const gameID = gameIDInput.value.trim();

      if (!gameID) {
        alert('Please enter a game ID');
        return;
      }

      try {
        await this.gameManager.joinGame(gameID);
        // Update UI to show game joined
        // document.getElementById('pregame-menu').style.display = 'none';
        // document.getElementById('game-container').style.display = 'block';
      } catch (error) {
        console.error('Failed to join game:', error);
        alert('Failed to join game: ' + error.message);
      }
    });

    startGame.addEventListener('click', async () => {
      try {
        // Create game with current settings from form inputs
        this.gameSettings = {
          ballSpeed: parseFloat(document.getElementById('ball-speed').value),
          paddleSize: parseFloat(document.getElementById('paddle-size').value),
          paddleSpeed: parseFloat(document.getElementById('paddle-speed').value),
          winScore: parseInt(document.getElementById('win-score').value)
        };
    
        // Create the game
        const gameData = await this.gameManager.createGame();
        this.gameId = gameData.game_id;
    
        // Show waiting screen
        document.getElementById('pregame-menu').style.display = 'none';
        isAnimating = false;
        document.getElementById('waiting-screen').style.display = 'flex';
        document.getElementById('waiting-game-id').textContent = this.gameId;
    
        this.waitingForPlayer = true;
    
        // Send game settings to server
        // this.gameManager.sendGameEvent('game_settings', this.gameSettings);
        
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to create game. Please try again.');
      }
    });
  }
    
  handleGameUpdate(data) {
    console.log('Game update received:', data);
  
    if (!data) {
      console.error('No data received in game update');
      return;
    }
  
    switch (data.type) {
      case 'player_joined':
        
        // If player 2 joined and we're player 1 (waiting)
        if (this.waitingForPlayer && data.player === 'right') {
          // Show that player 2 has joined
          const waitingMessage = document.getElementById('waiting-message');
          if (waitingMessage) {
            waitingMessage.textContent = 'Player 2 joined! Preparing game...';
          }
          
          // Send ready status to backend
          this.gameManager.sendReadyStatus();
        }
        
        // If we're player 2, send ready status immediately
        if (this.gameManager.localPlayer === 'right') {
          this.gameManager.sendReadyStatus();
        }
        break;
  
      case 'game_start':
        // Both players are ready, we can start the game
        console.log('Both players ready, starting game!');
        
        // Hide waiting screen (if it's visible)
        const waitingScreen = document.getElementById('waiting-screen');
        if (waitingScreen) {
          waitingScreen.style.display = 'none';
        }
        if (isAnimating == true)
          isAnimating = false;
        // Show game container
        document.getElementById('game-container').style.display = 'block';
        
        // Initialize game with settings
        this.gameInstance = initGame(
          this.gameSettings.ballSpeed, 
          this.gameSettings.paddleSize, 
          this.gameSettings.paddleSpeed, 
          this.gameSettings.winScore
        );
        if (!this.gameInstance)
            break;//TODO : throw err
        // Connect game to gameManager for WebSocket communication
        this.gameInstance.gameManager = this.gameManager;
        
        // Start the animation loop
        startGameLoop(this.gameInstance, this.gameSettings.winScore);
        break;
        
      case 'player_move':
        // Only process moves if we have a game instance
        if (!this.gameInstance) return;
        
        // Mouvement du joueur distant (opposé au joueur local)
        if (data.player === 'left' && this.gameManager.localPlayer === 'right') {
          if (data.direction === 'up') {
            this.gameInstance.playerLeft.moveUp();
          } else if (data.direction === 'down') {
            this.gameInstance.playerLeft.moveDown();
          } else if (data.direction === 'stop') {
            this.gameInstance.playerLeft.dy = 0;
          }
        } else if (data.player === 'right' && this.gameManager.localPlayer === 'left') {
          if (data.direction === 'up') {
            this.gameInstance.playerRight.moveUp();
          } else if (data.direction === 'down') {
            this.gameInstance.playerRight.moveDown();
          } else if (data.direction === 'stop') {
            this.gameInstance.playerRight.dy = 0;
          }
        }
        break;
  
      // ... rest of your cases ...
    }
  }
}
