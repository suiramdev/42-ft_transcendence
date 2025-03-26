import { Page } from '../core/Page.js';
import { GameManager } from './gameManager.js';
import {Player, movePlayer, stopPlayer, ball, updatePos, checkXCollision, updateScore, Game, pregame, animate, initGame, startGameLoop} from '../components/game.js';
 
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

    console.log('game is loaded!');

    let canvas = document.getElementById('pongCanvas');
    
 

    
    pregame();
    // Écouter les mises à jour du jeu
    document.addEventListener('game-update', event => {
      const gameData = event.detail;
      this.handleGameUpdate(gameData);
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
        document.getElementById('waiting-screen').style.display = 'flex';
        document.getElementById('waiting-game-id').textContent = this.gameId;
    
        this.waitingForPlayer = true;
    
        // Send game settings to server
        this.gameManager.sendGameEvent('game_settings', this.gameSettings);
        
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to create game. Please try again.');
      }
    });
  }
    
  handleGameUpdate(event) {
    const data = event.detail;
    console.log('Game update received:', data);

    switch (data.type) {
      case 'player_joined':
        // Player 2 has joined
        if (this.waitingForPlayer) {
          this.waitingForPlayer = false;
          // Hide waiting screen and show game
          document.getElementById('waiting-screen').style.display = 'none';
          document.getElementById('game-container').style.display = 'block';
          
          // Initialize game with settings and store the instance
          this.gameInstance = initGame(
            this.gameSettings.ballSpeed, 
            this.gameSettings.paddleSize, 
            this.gameSettings.paddleSpeed, 
            this.gameSettings.winScore
          );
          
          // Connect game to gameManager for WebSocket communication
          this.gameInstance.gameManager = this.gameManager;
          
          // Now start the animation loop separately
          startGameLoop(this.gameInstance, this.gameSettings.winScore);
        }
        break;

      case 'player_move':
        // Mouvement du joueur distant
        if (data.player === 'left') {
          if (data.direction === 'up') {
            player_left.moveUp();
          } else if (data.direction === 'down') {
            player_left.moveDown();
          } else if (data.direction === 'stop') {
            player_left.dy = 0;
          }
        } else if (data.player === 'right') {
          if (data.direction === 'up') {
            player_right.moveUp();
          } else if (data.direction === 'down') {
            player_right.moveDown();
          } else if (data.direction === 'stop') {
            player_right.dy = 0;
          }
        }
        break;

      case 'ball_update':
        // Mise à jour de la position de la balle
        // Cette mise à jour devrait provenir du serveur qui fait autorité
        this.gameInstance.ball.x = data.x;
        this.gameInstance.ball.y = data.y;
        this.gameInstance.ball.direction_x = data.direction_x;
        this.gameInstance.ball.direction_y = data.direction_y;
        break;

      case 'score_update':
        // Mise à jour du score
        player_left.scoreCount = data.left_score;
        player_right.scoreCount = data.right_score;
        updateScore();
        break;

      case 'game_start':
        // Démarrage de la partie
        document.getElementById('pregame-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        // Initialiser le jeu avec les paramètres reçus
        initGame(data.ballSpeed, data.paddleSize, data.paddleSpeed, data.winScore);
        break;

      case 'game_over':
        // Fin de la partie
        console.log('Game over. Winner:', data.winner);
        // Afficher l'écran de fin avec le gagnant
        break;

      default:
        console.log('Unknown update type:', data.type);
    }
  }
}
