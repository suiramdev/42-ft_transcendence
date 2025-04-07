import { Page } from '../core/Page.js';
import { GameManager } from './gameManager.js';
import { setupSliders, Player, movePlayer, stopPlayer, ball, updatePos, checkXCollision, updateScore, Game, pregame, animate, initGame, startGameLoop} from '../components/game.js';
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

        // Validate settings before creating game
        const validation = this.validateGameSettings(this.gameSettings);
        if (!validation.valid) {
            throw new Error(validation.reason);
        }    
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
    
  validateGameSettings(settings) {
    // First check if all required settings exist
    if (!settings || typeof settings !== 'object') {
      return { valid: false, reason: 'Invalid settings object' };
    }

    const requiredSettings = ['ballSpeed', 'paddleSize', 'paddleSpeed', 'ballSize', 'winScore'];
    for (const setting of requiredSettings) {
      if (!(setting in settings)) {
        return { valid: false, reason: `Missing ${setting} setting` };
      }
    }

    // Validate ranges for each setting
    const validations = {
      ballSpeed: { min: 0.05, max: 0.3 },
      paddleSize: { min: 2, max: 7 },
      paddleSpeed: { min: 0.1, max: 0.4 },
      ballSize: { min: 0.1, max: 1.5 },
      winScore: { validValues: [3, 5, 7] }
    };

    for (const [setting, range] of Object.entries(validations)) {
      if ('validValues' in range) {
        if (!range.validValues.includes(parseInt(settings[setting]))) {
          return { 
            valid: false, 
            reason: `${setting} must be one of ${range.validValues.join(', ')}` 
          };
        }
      } else {
        const value = parseFloat(settings[setting]);
        if (value < range.min || value > range.max) {
          return { 
            valid: false, 
            reason: `${setting} must be between ${range.min} and ${range.max}` 
          };
        }
      }
    }

    return { valid: true };
  }

  // Add this server-side validation check for player settings
  comparePlayerSettings(player1Settings, player2Settings) {
    // First validate each player's settings individually
    const p1Validation = this.validateGameSettings(player1Settings);
    const p2Validation = this.validateGameSettings(player2Settings);

    if (!p1Validation.valid) {
      return { valid: false, reason: `Player 1: ${p1Validation.reason}` };
    }
    if (!p2Validation.valid) {
      return { valid: false, reason: `Player 2: ${p2Validation.reason}` };
    }

    // Then compare settings between players
    for (const key of Object.keys(player1Settings)) {
      if (player1Settings[key] !== player2Settings[key]) {
        return {
          valid: false,
          reason: `Mismatched ${key} settings between players`,
          mismatch: {
            setting: key,
            player1: player1Settings[key],
            player2: player2Settings[key]
          }
        };
      }
    }

    return { valid: true };
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
        }
        break;
  
      case 'game-settings':
        if (this.gameManager.localPlayer === 'right') {
          // Validate received settings
          const validation = this.validateGameSettings(data.settings);
          if (!validation.valid) {
            this.gameManager.sendGameEvent('game-settings-received', {
              status: 'rejected',
              reason: validation.reason,
              gameId: this.gameId
            });
            return;
          }
          
          this.gameSettings = data.settings;
          this.gameManager.sendGameEvent('game-settings-received', {
            status: 'accepted',
            gameId: this.gameId
          });
          this.gameManager.sendReadyStatus();
        }
        break;
  
      case 'game-settings-received':
        if (this.gameManager.localPlayer === 'left') {
          if (data.status === 'accepted') {
            // Settings confirmed, host can now send ready
            this.gameManager.sendReadyStatus();
          } else {
            // Handle rejected settings
            console.error('Game settings were rejected:', data.reason);
            alert('Game settings were rejected by other player');
          }
        }
        break;
  
      case 'game_start':
        // Both players ready and settings validated by backend
        console.log('Both players ready, starting game!');
        this.startGame();
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
