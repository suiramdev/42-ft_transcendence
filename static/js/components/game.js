import * as THREE from 'three';
import { GameManager } from '../pages/gameManager.js';
   
   // ----------------- Player Class -----------------

    export class Player {
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

    // ----------------- Ball Class -----------------

    export class ball {
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
      moveBall(player_left, player_right) {
        // Lorsque la balle touche le paddle, ajuster sa position légèrement au-delà du paddle
        if (
          this.isBallinPlayer(
            player_left.getx(),
            player_left.gety(),
            player_left.getwidth(),
            player_left.getheight()
          )
        ) {
          // Si la balle touche le paddle gauche
          this.direction_x = 1; // Inverser la direction horizontale
          this.x = player_left.getx() + player_left.getwidth() / 2 + this.radius; // Déplacer légèrement la balle après la collision
          // En fonction de la position verticale du paddle et de la balle, ajuster la direction verticale
          const paddleCenter = player_left.gety();
          const ballRelativePosition = this.y - paddleCenter; // Calculer la distance entre la balle et le centre du paddle
          this.direction_y = ballRelativePosition / player_left.getheight(); // Utiliser cette distance pour ajuster la direction verticale
        } else if (
          this.isBallinPlayer(
            player_right.getx(),
            player_right.gety(),
            player_right.getwidth(),
            player_right.getheight()
          )
        ) {
          // Si la balle touche le paddle droit
          this.direction_x = -1; // Inverser la direction horizontale
          this.x = player_right.getx() - this.radius - player_right.getwidth() / 2; // Déplacer légèrement la balle après la collision
          // Ajuster la direction verticale de la même manière
          const paddleCenter = player_right.gety();
          const ballRelativePosition = this.y - paddleCenter;
          this.direction_y = ballRelativePosition / player_right.getheight();
        } else if (this.isBallinYWall()) {
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

    export function updatePos(game) {
        if (!game) return;
        
        game.playerRight.y += game.playerRight.dy;
        game.playerLeft.y += game.playerLeft.dy;
      
        // Check boundaries for player right
        if (game.playerRight.y + game.playerRight.getheight() / 2 > 9) {
          game.playerRight.y = 9 - game.playerRight.getheight() / 2;
        } else if (game.playerRight.y - game.playerRight.getheight() / 2 < -9) {
          game.playerRight.y = -9 + game.playerRight.getheight() / 2;
        }
        
        // Check boundaries for player left
        if (game.playerLeft.y + game.playerLeft.getheight() / 2 > 9) {
          game.playerLeft.y = 9 - game.playerLeft.getheight() / 2;
        } else if (game.playerLeft.y - game.playerLeft.getheight() / 2 < -9) {
          game.playerLeft.y = -9 + game.playerLeft.getheight() / 2;
        }
      
        // Update positions of visual elements
        game.playerRight.pCube.position.y = game.playerRight.y;
        game.playerLeft.pCube.position.y = game.playerLeft.y;
      
        game.ball.bSphere.position.x = game.ball.x;
        game.ball.bSphere.position.y = game.ball.y;
      }

    export function checkXCollision(game, winScore) {
      if (game.ball.isBallinXWall()) {
        if (game.ball.x < 0) {
          game.playerRight.incrementScore();
          if (game.playerRight.getScore() < winScore) {
            game.ball.resetBall(-1);
            game.playerRight.resetPlayer();
            game.playerLeft.resetPlayer();
          } else return false; // Game over
        } else {
            game.playerLeft.incrementScore();
          if (game.playerLeft.getScore() < winScore) {
            game.ball.resetBall(1);
            game.playerRight.resetPlayer();
            game.playerLeft.resetPlayer();
          } else return false; // Game over
        }
      }
      return true; // Game continues
    }

    // ----------------- ath function -----------------

    export const updateScore = function (playerLeft, playerRight) {
        // Only update if the score elements exist
        const scoreDisplay = document.getElementById('score');
        if (scoreDisplay && playerLeft && playerRight) {
          scoreDisplay.textContent = `${playerLeft.getScore()} | ${playerRight.getScore()}`;
        }
    };

    export class Game {
        constructor(ballSpeed, paddleSize, paddleSpeed, ballSize, winScore, gameManager) {
            this.gameManager = gameManager;
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
            this.isGameRunning = true;
            this.winScore = winScore;

            // Initialisation
            this.setup3D(ballSpeed, paddleSize, paddleSpeed, ballSize);
            this.addEventListeners();
        }
  
        // ----------------- 3D setup -----------------
  
        setup3D(ballSpeed, paddleSize, paddleSpeed, ballSize) {
          const canvas = document.getElementById('pongCanvas');
          this.renderer = new THREE.WebGLRenderer({ canvas });
          this.renderer.setSize(canvas.width, canvas.height);
          this.scene = new THREE.Scene();
          this.camera = new THREE.PerspectiveCamera(100, canvas.width / canvas.height, 5, 100);
          this.camera.position.z = 8;
          this.camera.position.y = 0;
          // Check if all elements exist
          
          const geometry = new THREE.BoxGeometry(50, 25, 0);
  
          // Charger la texture
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load('/static/Windows.jpg');
  
          // Appliquer la texture au matériau
          const material = new THREE.MeshPhongMaterial({ map: texture });
          const cube = new THREE.Mesh(geometry, material);
          cube.position.z = -2;
          this.scene.add(cube);
          // Initialize game objects
          this.playerLeft = new Player(-10, 0, 0, paddleSize, paddleSpeed, 'green');
          this.playerLeft.sceneADD(this.scene);
  
          this.playerRight = new Player(10, 0, 0, paddleSize, paddleSpeed, 'blue');
          this.playerRight.sceneADD(this.scene);
  
          console.log("ball speed : " , ballSpeed);
          this.ball = new ball(0, 0, 0, 1, 1, ballSpeed, ballSize, 'red');
          this.ball.sceneADD(this.scene);
  
          // Lumière ambiante (plus faible, pour adoucir les ombres)
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
          this.scene.add(ambientLight);
  
          // Lumière directionnelle (simule une lumière venant du dessus)
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(5, 10, 10); // Position au-dessus et sur le côté
          directionalLight.castShadow = true; // Active les ombres
          this.scene.add(directionalLight);
  
          // Lumière ponctuelle (simule une source lumineuse comme une lampe)
          const pointLight = new THREE.PointLight(0xffaa33, 1.5, 20);
          pointLight.position.set(0, 5, 5);
          this.scene.add(pointLight);
  
          // Optionnel : une lumière spot pour un effet dramatique
          const spotLight = new THREE.SpotLight(0xff0000, 1);
          spotLight.position.set(-5, 10, 5);
          spotLight.angle = Math.PI / 6;
          spotLight.penumbra = 0.5;
          this.scene.add(spotLight);
  
          // Lumière dédiée au background (douce et large)
          const backgroundLight = new THREE.DirectionalLight(0xffffff, 5);
          backgroundLight.position.set(0, 5, -5); // Positionnée derrière la scène
          backgroundLight.target = cube; // Dirige la lumière vers le cube (background)
          this.scene.add(backgroundLight);
  
          return true;
        }
  
        handleKeyDown(e) {
          if (e.code === 'ArrowUp' || e.code === 'KeyW') {
              // C'est une commande du joueur local
              this.gameManager.sendPlayerMove('up');
  
              // Mettre à jour localement pour une réactivité immédiate
              if (this.gameManager.localPlayer === 'left') {
                this.playerLeft.moveUp();
              } else {
                this.playerRight.moveUp();
              }
          } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
              // C'est une commande du joueur local
              this.gameManager.sendPlayerMove('down');
  
              // Mettre à jour localement pour une réactivité immédiate
              if (this.gameManager.localPlayer === 'left') {
                this.playerLeft.moveDown();
              } else {
                this.playerRight.moveDown();
              }
          }
        }
  
        handleKeyUp(e) {
          if (
            e.code === 'ArrowUp' ||
            e.code === 'ArrowDown' ||
            e.code === 'KeyW' ||
            e.code === 'KeyS'
          ) {
              this.gameManager.sendPlayerMove('stop');
  
              // Mettre à jour localement pour une réactivité immédiate
              if (this.gameManager.localPlayer === 'left') {
                this.playerLeft.dy = 0;
              } else {
                this.playerRight.dy = 0;
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
          while (this.scene.children.length > 0) {
            this.scene.remove(scene.children[0]);
          }
  
          // Nettoyage des ressources
          this.playerLeft.pCube.geometry.dispose();
          this.playerLeft.pCube.material.dispose();
          this.playerRight.pCube.geometry.dispose();
          this.playerRight.pCube.material.dispose();
          this.ball.bSphere.geometry.dispose();
          this.ball.bSphere.material.dispose();
  
          // Interface utilisateur
          const gameContainer = document.getElementById('game-container');
          gameContainer.style.display = 'none';
  
          // Message du gagnant
          const winner =
            this.playerLeft.getScore() > this.playerRight.getScore() ? this.playerLeft.nickname : this.playerRight.nickname;
          const winnerMessage = document.createElement('div');
          winnerMessage.textContent = `${winner} Wins!`;
          winnerMessage.style.color = 'black';
          winnerMessage.style.fontSize = '24px';
          winnerMessage.style.marginBottom = '20px';
          canvas.insertBefore(winnerMessage, canvas.firstChild);
  
          // Nettoyage final
          this.renderer.dispose();
          this.playerLeft.scoreCount = 0;
          this.playerRight.scoreCount = 0;
          updateScore();
        }
    }

      // ----------------- Pregame function -----------------
    export function pregame() {
        const pregameMenu = document.getElementById('pregame-menu');
        const gameContainer = document.getElementById('game-container');
        const canvas = document.getElementById('pongCanvas');
  
        if (!canvas || !pregameMenu || !gameContainer) {
          console.log('Waiting for game elements to load...');
          setTimeout(pregame, 100);
          return;
        }
    }
  
      
  
    export function animate(game, winScore) {
        if (!game || !game.isGameRunning) return;
        
        requestAnimationFrame(() => animate(game, winScore));
        console.log("win score : ", winScore);
        if (checkXCollision(game, winScore)) {
          updatePos(game);
          game.ball.moveBall(game.playerLeft, game.playerRight);
          updateScore(game.playerLeft, game.playerRight);
          game.renderer.render(game.scene, game.camera);
        } else {
          game.endgame();
          return;
        }
      }
  
      export function initGame(ballSpeed, paddleSize, paddleSpeed, winScore) {
        // Validate parameters
        if (
          ballSpeed === undefined ||
          paddleSize === undefined ||
          paddleSpeed === undefined ||
          winScore === undefined
        ) {
          console.error('Missing game parameters');
          return null;
        }
      
        // Initialize the game
        const game = new Game(ballSpeed, paddleSize, paddleSpeed, winScore);
        
        // Return the game without starting animation yet
        return game;
      }

      export function startGameLoop(game, winScore) {
        if (!game) {
          console.error('No game instance provided');
          return;
        }
        
        // Start the animation loop
        animate(game, winScore);
      }

      export function setupSliders() {
        // Ball speed slider
        const ballSpeedSlider = document.getElementById('ball-speed');
        const ballSpeedValue = document.getElementById('ball-speed-value');
        if (ballSpeedSlider && ballSpeedValue) {
          ballSpeedSlider.addEventListener('input', function() {
            ballSpeedValue.textContent = this.value;
          });
        }
      
        // Paddle size slider
        const paddleSizeSlider = document.getElementById('paddle-size');
        const paddleSizeValue = document.getElementById('paddle-size-value');
        if (paddleSizeSlider && paddleSizeValue) {
          paddleSizeSlider.addEventListener('input', function() {
            paddleSizeValue.textContent = this.value;
          });
        }
      
        // Paddle speed slider
        const paddleSpeedSlider = document.getElementById('paddle-speed');
        const paddleSpeedValue = document.getElementById('paddle-speed-value');
        if (paddleSpeedSlider && paddleSpeedValue) {
          paddleSpeedSlider.addEventListener('input', function() {
            paddleSpeedValue.textContent = this.value;
          });
        }
      
        // Win score slider
        const winScoreSlider = document.getElementById('win-score');
        const winScoreValue = document.getElementById('win-score-value');
        if (winScoreSlider && winScoreValue) {
          winScoreSlider.addEventListener('input', function() {
            winScoreValue.textContent = this.value;
          });
        }
      }