import { Page } from '../core/Page.js';
import { GameManager } from './gameManager.js';
import { setupSliders,Game, pregame, startGameLoop} from '../components/game.js';
import { pregameSetup, stopPregameAnimations, getIsAnimating} from './pregame.js'; 

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
      ballSize: 0.5,
      winScore: 3
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
        
        // document.getElementById('game-container').style.display = 'block';
      } catch (error) {
        console.error('Failed to join game:', error);
        alert('Failed to join game: ' + error.message);
      }
    });

    startGame.addEventListener('click', async () => {
      try {
        const settingsElements = {
          ballSpeed: document.getElementById('ball-speed'),
          paddleSize: document.getElementById('paddle-size'),
          paddleSpeed: document.getElementById('paddle-speed'),
          ballSize: document.getElementById('ball-size'),
          winScore: document.querySelector('input[name="win-score"]:checked')
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(settingsElements)) {
            if (!element) {
                throw new Error(`Missing ${key} setting element`);
            }
        }

        this.gameSettings = {
            ballSpeed: parseFloat(settingsElements.ballSpeed.value),
            paddleSize: parseFloat(settingsElements.paddleSize.value),
            paddleSpeed: parseFloat(settingsElements.paddleSpeed.value),
            ballSize: parseFloat(settingsElements.ballSize.value),
            winScore: parseInt(settingsElements.winScore.value)
        };

        // Create the game
        const gameData = await this.gameManager.createGame();
        this.gameId = gameData.game_id;
        
        // Show waiting screen
        // document.getElementById('pregame-menu').style.display = 'none';
        if (getIsAnimating())
          stopPregameAnimations();
        document.getElementById('waiting-screen').style.display = 'flex';
        document.getElementById('waiting-game-id').textContent = this.gameId;
    
        this.waitingForPlayer = true;
    
        // Send game settings to server
        // this.gameManager.sendGameEvent('game_settings', this.gameSettings);
        
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to create game: ' + error.message);
      }
    });
  }



  handleGameUpdate(data) {
    switch (data.type) {
      case 'player_joined':
        if (this.waitingForPlayer && data.player === 'right') {
          // Show player 2 joined message
          const waitingMessage = document.getElementById('waiting-message');
          if (waitingMessage) {
            waitingMessage.textContent = 'Player 2 joined! Sending game settings...';
          }
          // Send settings to player 2
          this.gameManager.sendGameEvent('game-settings', {
            settings: this.gameSettings,
            gameId: this.gameId
          });
          this.gameManager.sendReadyStatus();
        }
        break;
  
      case 'game-settings':
        if (this.gameManager.localPlayer === 'right') {
          // Validate received settings
          this.gameSettings = data.settings;
          this.gameManager.sendReadyStatus();
        }
        break;
  

        case 'game_start':
          console.log('Both players ready, starting game!');
          console.log("im : ", this.gameManager.localPlayer);
          // Hide appropriate screens based on player type
          if (this.gameManager.localPlayer === 'left') {
              document.getElementById('waiting-screen').style.display = 'none';
          } else {
              // For right player, hide pregame menu
              document.getElementById('pregame-menu').style.display = 'none';
          }
          document.getElementById('game-container').style.display = 'flex';
          this.gameInstance = new Game(
              this.gameSettings.ballSpeed,
              this.gameSettings.paddleSize,
              this.gameSettings.paddleSpeed,
              this.gameSettings.ballSize,
              this.gameSettings.winScore,
              this.gameManager
          );
          startGameLoop(this.gameInstance, this.gameInstance.winScore);
          break;

      case 'end_game' :
        this.gameInstance.endgame();
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
    }
  }
}
