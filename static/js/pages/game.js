import { Page } from '../core/Page.js';
import { GameManager } from '../game/GameManager.js';
import * as THREE from 'three';

export class GamePage extends Page {
  constructor() {
    super('game.html', 'game.css');
    this.gameManager = new GameManager();
  }

  onMount() {
    console.log('Game page mounted');
    const startGame = document.getElementById('start-game');
    const joinGameButton = document.getElementById('join-game');
    

    
  console.log('game is loaded!');

  let canvas = document.getElementById('pongCanvas');
  let player_left;
  let player_right;
  let balll;
  let scene;
  let camera;
  let renderer;
  // ----------------- Player Class -----------------

  class Player {
    constructor(x, y, z, height, speed, color) {
      this.restX = x;
      this.x = x;
      this.restY = y;
      this.y = y;
      this.z = z;
      this.size = 0.5;
      this.height = height;
      this.hitbox = 1.4;
      this.speed = speed;
      this.dy = 0;
      this.color = color;
      this.scoreCount = 0;
      this.texture = 0;
    }
    sceneADD(scene) {
      const geometry = new THREE.BoxGeometry(this.size, this.height, this.size);
      const material = new THREE.MeshPhongMaterial({ color: this.color });
      const cube = new THREE.Mesh(geometry, material);
      this.pCube = cube;
      cube.position.x = this.x;
      cube.position.y = this.y;
      cube.position.z = this.z;

      scene.add(cube);
    }

    getx() {
      return this.x;
    }

    gety() {
      return this.y;
    }

    getz() {
      return this.z;
    }

    getwidth() {
      return this.size;
    }

    getheight() {
      return this.height;
    }

    getHitBox() {
      return this.hitbox;
    }

    moveUp() {
      if (this.y + this.size < 9) this.dy = this.speed;
    }
    moveDown() {
      if (this.y > -9) this.dy = -this.speed;
    }

    incrementScore() {
      this.scoreCount += 1;
    }

    getScore() {
      return this.scoreCount;
    }

    resetPlayer() {
      this.x = this.restX;
      this.y = this.restY;
      this.dy = 0;
    }
  }

  // ----------------- Player related functions -----------------

  // Move the players based on key input
  function movePlayer(e) {
    if (e.code === 'ArrowUp') {
      player_right.moveUp();
      // player_right.pCube.rotateZ(0.1);
    } else if (e.code === 'ArrowDown') {
      player_right.moveDown();
    } else if (e.code === 'KeyW') {
      player_left.moveUp();
    } else if (e.code === 'KeyS') {
      player_left.moveDown();
    }
  }

  // Stop the players when the key is released
  function stopPlayer(e) {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      player_right.dy = 0;
    } else if (e.code === 'KeyW' || e.code === 'KeyS') {
      player_left.dy = 0;
    }
  }

  // ----------------- Ball Class -----------------

  class ball {
    constructor(x, y, z, width, height, speed, radius, color, player_size) {
      this.x = x;
      this.resetX = x;
      this.y = y;
      this.resetY = y;
      this.z = z;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.resetSpeed = speed;
      this.radius = radius;
      this.color = color;
      this.direction_x = -1;
      this.direction_y = 1;
      this.player_size = player_size;
    }

    sceneADD(scene) {
      const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: this.color });
      const sphere = new THREE.Mesh(geometry, material);
      this.bSphere = sphere;
      sphere.position.x = this.x;
      sphere.position.y = this.y;
      sphere.position.z = this.z;
      scene.add(sphere);
    }

    isBallinPlayer(playerx, playery, playerWidth, playerHeight) {
      const ballLeft = this.x - this.radius;
      const ballRight = this.x + this.radius;
      const ballTop = this.y - this.radius;
      const ballBottom = this.y + this.radius;

      const playerLeft = playerx - playerWidth / 2;
      const playerRight = playerx + playerWidth / 2;
      const playerTop = playery - playerHeight / 2;
      const playerBottom = playery + playerHeight / 2;

      return (
        ballRight >= playerLeft &&
        ballLeft <= playerRight &&
        ballBottom >= playerTop &&
        ballTop <= playerBottom
      );
    }

    isBallinYWall() {
      if (this.y + this.radius >= 9 || this.y - this.radius <= -9) {
        return true;
      }
      return false;
    }

    isBallinXWall() {
      if (this.x + this.radius >= 15 || this.x - this.radius <= -15) {
        return true;
      }
      return false;
    }

    // Move the ball
    moveBall() {
      // Lorsque la balle touche le paddle, ajuster sa position légèrement au-delà du paddle
      if (this.isBallinPlayer(
        player_left.getx(),
        player_left.gety(),
        player_left.getwidth(),
        player_left.getheight()
      )) {
        // Si la balle touche le paddle gauche
        this.direction_x = 1; // Inverser la direction horizontale
        this.x = player_left.getx() + player_left.getwidth() / 2 + this.radius; // Déplacer légèrement la balle après la collision
        // En fonction de la position verticale du paddle et de la balle, ajuster la direction verticale
        const paddleCenter = player_left.gety();
        const ballRelativePosition = this.y - paddleCenter; // Calculer la distance entre la balle et le centre du paddle
        this.direction_y = ballRelativePosition / player_left.getheight(); // Utiliser cette distance pour ajuster la direction verticale
      } else if (this.isBallinPlayer(
        player_right.getx(),
        player_right.gety(),
        player_right.getwidth(),
        player_right.getheight()
      )) {
        // Si la balle touche le paddle droit
        this.direction_x = -1; // Inverser la direction horizontale
        this.x = player_right.getx() - this.radius - player_right.getwidth() / 2; // Déplacer légèrement la balle après la collision
        // Ajuster la direction verticale de la même manière
        const paddleCenter = player_right.gety();
        const ballRelativePosition = this.y - paddleCenter;
        this.direction_y = ballRelativePosition / player_right.getheight();
      }
      else if (this.isBallinYWall()){
        this.direction_y *= -1;
      }
      this.x += this.speed * this.direction_x; // Continue moving right
      this.y += this.speed * this.direction_y; // Adjust vertical position
    }

    resetBall(xdir) {
      this.x = this.resetX;
      this.y = this.resetY;
      this.speed = this.resetSpeed;
      this.direction_x = xdir;
      this.direction_y = 1;
    }
  }

  // ----------------- Ball and Player related functions -----------------

  function updatePos() {
    player_right.y += player_right.dy;
    player_left.y += player_left.dy;

    if (player_right.y + player_right.getheight() / 2 > 9) {
      player_right.y = 9 - player_right.getheight() / 2;
    } else if (player_right.y - player_right.getheight() / 2 < -9) {
        player_right.y = -9 + player_right.getheight() / 2;
    }

    if (player_left.y + player_left.getheight() / 2 > 9) {
        player_left.y = 9 - player_left.getheight() / 2;
    } else if (player_left.y - player_left.getheight() / 2 < -9) {
        player_left.y = -9 + player_left.getheight() / 2;
    }


    player_right.pCube.position.y = player_right.y;
    player_left.pCube.position.y = player_left.y;

    balll.bSphere.position.x = balll.x;
    balll.bSphere.position.y = balll.y;
  }

  function checkXCollision(winScore) {
    if (balll.isBallinXWall()) {
        if (balll.x < 0) {
          player_right.incrementScore();
          if (player_right.getScore() < winScore) {
              balll.resetBall(-1);
              player_right.resetPlayer();
              player_left.resetPlayer();
          }
          else return false; // Game over
      } else {
          player_left.incrementScore();
          if (player_left.getScore() < winScore) {
              balll.resetBall(1);
              player_right.resetPlayer();
              player_left.resetPlayer();
          }
          else return false; // Game over
      }
    }
    return true; // Game continues
  }



  // ----------------- ath function -----------------

  const updateScore = function () {

    // Only update if the score elements exist
    const scoreDisplay = document.getElementById("score");
    scoreDisplay.textContent = `${player_left.getScore()} | ${player_right.getScore()}`;
  };


  // ----------------- Pregame function -----------------
  function pregame() {
      const pregameMenu = document.getElementById('pregame-menu');
      const gameContainer = document.getElementById('game-container');
      const canvas = document.getElementById('pongCanvas');
      
      if (!canvas || !pregameMenu || !gameContainer) {
        console.log('Waiting for game elements to load...');
        setTimeout(pregame, 100);
        return;
      }
    
      // Add event listeners for sliders
      const sliders = pregameMenu.querySelectorAll('input[type="range"]');
      sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}-value`);
        slider.addEventListener('input', () => {
          valueDisplay.textContent = slider.value;
        });
      });
    
      // Start game button handler
      const startButton = document.getElementById('start-game');
      startButton.addEventListener('click', () => {
        // Get values from sliders
        const ballSpeed = parseFloat(document.getElementById('ball-speed').value);
        const paddleSize = parseFloat(document.getElementById('paddle-size').value);
        const paddleSpeed = parseFloat(document.getElementById('paddle-speed').value);
        const winScore = parseInt(document.getElementById('win-score').value);
    
        // Hide pregame menu and show game
        pregameMenu.style.display = 'none';
        gameContainer.style.display = 'block';
    
        // Start the game with custom settings
        initGame(ballSpeed, paddleSize, paddleSpeed, winScore);
      });
    }

    class Game {
      constructor(ballSpeed, paddleSize, paddleSpeed) {
          this.handleKeyDown = this.handleKeyDown.bind(this);
          this.handleKeyUp = this.handleKeyUp.bind(this);
          this.isGameRunning = true;
          
          // Initialisation
          this.setup3D(ballSpeed, paddleSize, paddleSpeed);
          this.addEventListeners();
      }

      // ----------------- 3D setup -----------------

      setup3D(ballSpeed, paddleSize, paddleSpeed, backgroundTextur) {
          const canvas = document.getElementById('pongCanvas');
          renderer = new THREE.WebGLRenderer({ canvas });
          renderer.setSize(canvas.width, canvas.height);
          scene = new THREE.Scene();
          camera = new THREE.PerspectiveCamera(100, canvas.width / canvas.height, 5, 100);
          camera.position.z = 8;
          camera.position.y = 0;

          const geometry = new THREE.BoxGeometry( 50, 25, 0 );
          
          // Charger la texture
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load('/static/Windows.jpg');
          
          // Appliquer la texture au matériau
          const material = new THREE.MeshPhongMaterial({ map: texture });
          const cube = new THREE.Mesh( geometry, material );
          cube.position.z = -2;
          scene.add(cube);
          // Initialize game objects
          player_left = new Player(-10, 0, 0, paddleSize, paddleSpeed, 'green');
          player_left.sceneADD(scene);

          player_right = new Player(10, 0, 0, paddleSize, paddleSpeed, 'blue');
          player_right.sceneADD(scene);

          balll = new ball(0, 0, 0, 1, 1, ballSpeed, 0.5, 'red');
          balll.sceneADD(scene);

          // Lumière ambiante (plus faible, pour adoucir les ombres)
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
          scene.add(ambientLight);

          // Lumière directionnelle (simule une lumière venant du dessus)
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(5, 10, 10); // Position au-dessus et sur le côté
          directionalLight.castShadow = true; // Active les ombres
          scene.add(directionalLight);

          // Lumière ponctuelle (simule une source lumineuse comme une lampe)
          const pointLight = new THREE.PointLight(0xffaa33, 1.5, 20);
          pointLight.position.set(0, 5, 5);
          scene.add(pointLight);

          // Optionnel : une lumière spot pour un effet dramatique
          const spotLight = new THREE.SpotLight(0xff0000, 1);
          spotLight.position.set(-5, 10, 5);
          spotLight.angle = Math.PI / 6;
          spotLight.penumbra = 0.5;
          scene.add(spotLight);


          // Lumière dédiée au background (douce et large)
          const backgroundLight = new THREE.DirectionalLight(0xffffff, 5);
          backgroundLight.position.set(0, 5, -5); // Positionnée derrière la scène
          backgroundLight.target = cube; // Dirige la lumière vers le cube (background)
          scene.add(backgroundLight);


          return true;
      }
      handleKeyDown(e) {
        // Identifier quelle raquette contrôler en fonction du joueur local
        const isLocalPlayerLeft = this.gameManager.localPlayer === 'left';
        
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            if ((isLocalPlayerLeft && e.code === 'KeyW') || 
                (!isLocalPlayerLeft && e.code === 'ArrowUp')) {
                // C'est une commande du joueur local
                this.gameManager.sendPlayerMove('up');
                
                // Mettre à jour localement pour une réactivité immédiate
                if (isLocalPlayerLeft) {
                    player_left.moveUp();
                } else {
                    player_right.moveUp();
                }
            }
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            if ((isLocalPlayerLeft && e.code === 'KeyS') || 
                (!isLocalPlayerLeft && e.code === 'ArrowDown')) {
                // C'est une commande du joueur local
                this.gameManager.sendPlayerMove('down');
                
                // Mettre à jour localement pour une réactivité immédiate
                if (isLocalPlayerLeft) {
                    player_left.moveDown();
                } else {
                    player_right.moveDown();
                }
            }
        }
    }
    
    handleKeyUp(e) {
        // Identifier quelle raquette contrôler en fonction du joueur local
        const isLocalPlayerLeft = this.gameManager.localPlayer === 'left';
        
        if ((e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS')) {
            if ((isLocalPlayerLeft && (e.code === 'KeyW' || e.code === 'KeyS')) || 
                (!isLocalPlayerLeft && (e.code === 'ArrowUp' || e.code === 'ArrowDown'))) {
                // C'est une commande du joueur local
                this.gameManager.sendPlayerMove('stop');
                
                // Mettre à jour localement pour une réactivité immédiate
                if (isLocalPlayerLeft) {
                    player_left.dy = 0;
                } else {
                    player_right.dy = 0;
                }
            }
        }
    }

      addEventListeners() {
          document.addEventListener('keydown', this.handleKeyDown);
          document.addEventListener('keyup', this.handleKeyUp);
      }

      removeEventListeners() {
          document.removeEventListener('keydown', this.handleKeyDown);
          document.removeEventListener('keyup', this.handleKeyUp);
      }

      endgame() {
          this.isGameRunning = false;
          this.removeEventListeners();
          
          // Nettoyage de la scène
          while(scene.children.length > 0) { 
              scene.remove(scene.children[0]); 
          }

          // Nettoyage des ressources
          player_left.pCube.geometry.dispose();
          player_left.pCube.material.dispose();
          player_right.pCube.geometry.dispose();
          player_right.pCube.material.dispose();
          balll.bSphere.geometry.dispose();
          balll.bSphere.material.dispose();

          // Interface utilisateur
          const gameContainer = document.getElementById('game-container');
          gameContainer.style.display = 'none';
          
          

          // Message du gagnant
          const winner = player_left.getScore() > player_right.getScore() ? "Left Player" : "Right Player";
          const winnerMessage = document.createElement('div');
          winnerMessage.textContent = `${winner} Wins!`;
          winnerMessage.style.color = 'black';
          winnerMessage.style.fontSize = '24px';
          winnerMessage.style.marginBottom = '20px';
          canvas.insertBefore(winnerMessage, canvas.firstChild);

          // Nettoyage final
          renderer.dispose();
          player_left.scoreCount = 0;
          player_right.scoreCount = 0;
          updateScore();
      }
  }

  function animate(game, winScore) {
      if (!game.isGameRunning) return ;
      requestAnimationFrame(() => animate(game, winScore));
      if (checkXCollision(winScore)) {
          updatePos();
          balll.moveBall();
          updateScore();
          renderer.render(scene, camera);
      }
      else{
        game.endgame();
        return ;
      }
  };

  function initGame(ballSpeed, paddleSize, paddleSpeed, winScore) {
    // Initialiser seulement si nous avons les paramètres nécessaires
    if (ballSpeed === undefined || paddleSize === undefined || 
        paddleSpeed === undefined || winScore === undefined) {
      console.error('Missing game parameters');
      return null;
    }
    
    // Initialiser le jeu
    const game = new Game(ballSpeed, paddleSize, paddleSpeed);
    
    // En mode multijoueur, démarrer l'animation
    // Mais ne pas gérer la logique de la balle si vous n'êtes pas l'hôte (serveur)
    animate(game, winScore);
    
    return game;
}

  pregame();
      // Écouter les mises à jour du jeu
      document.addEventListener('game-update', (event) => {
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
    
    // Ajoutez après le startButton click event listener

startGame.addEventListener('click', async e => {
  try {
    // Récupérer les paramètres du jeu depuis l'interface
    const ballSpeed = parseFloat(document.getElementById('ball-speed').value);
    const paddleSize = parseFloat(document.getElementById('paddle-size').value);
    const paddleSpeed = parseFloat(document.getElementById('paddle-speed').value);
    const winScore = parseInt(document.getElementById('win-score').value);
    
    // Créer la partie sur le serveur
    const gameData = await this.gameManager.createGame();
    
    // Envoyer les paramètres de jeu aux autres joueurs
    this.gameManager.sendGameEvent('game_config', {
      ballSpeed,
      paddleSize,
      paddleSpeed,
      winScore
    });
    
    // Afficher l'ID de la partie pour que d'autres puissent la rejoindre
    const gameIdDisplay = document.createElement('div');
    gameIdDisplay.textContent = `Partie créée! ID: ${gameData.game_id}`;
    gameIdDisplay.style.marginTop = '20px';
    document.getElementById('pregame-menu').appendChild(gameIdDisplay);
    
  } catch (error) {
    console.error('Failed to start game:', error);
    alert('Erreur lors de la création de la partie: ' + error.message);
  }
});
  }
  
  // ... code existant ...

handleGameUpdate(data) {
  console.log('Handling game update:', data);
  
  // Selon le type de mise à jour reçue
  switch(data.type) {
    case 'player_joined':
      // Un joueur a rejoint la partie
      console.log('Player joined:', data.player);
      // Vous pourriez afficher une notification ou changer l'état de l'interface
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
      balll.x = data.x;
      balll.y = data.y;
      balll.direction_x = data.direction_x;
      balll.direction_y = data.direction_y;
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
      initGame(
        data.ballSpeed, 
        data.paddleSize, 
        data.paddleSpeed,
        data.winScore
      );
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