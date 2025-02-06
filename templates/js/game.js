import * as THREE from 'three';
console.log('game is loaded!');

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
    this.size = 1;
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
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('textures/cube/pisa/');
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
    if (this.y + this.size < 8) this.dy = this.speed;
  }
  moveDown() {
    if (this.y > -8) this.dy = -this.speed;
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
    if (this.y + this.radius >= 8 || this.y - this.radius <= -8) {
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
    // Move the ball based on direction
    if (this.direction_x === -1) {
      // Check collision with the left paddle
      if (
        this.isBallinPlayer(
          player_left.getx(),
          player_left.gety(),
          player_left.getwidth(),
          player_left.getheight()
        )
      ) {
        this.direction_x = 1; // Reverse horizontal direction
        this.x = player_left.getx() + player_left.getwidth() + this.radius; // Move ball just outside the paddle
      } else {
        if (this.isBallinYWall()) {
          this.direction_y *= -1; // Reverse vertical direction when hitting top/bottom walls
        }
        this.x -= this.speed; // Continue moving left
        this.y += this.speed * this.direction_y; // Adjust vertical position
      }
    } else if (this.direction_x === 1) {
      // Check collision with the right paddle
      if (
        this.isBallinPlayer(
          player_right.getx(),
          player_right.gety(),
          player_right.getwidth(),
          player_right.getheight()
        )
      ) {
        this.direction_x = -1; // Reverse horizontal direction
        this.x = player_right.getx() - this.radius; // Move ball just outside the paddle
      } else {
        if (this.isBallinYWall()) {
          this.direction_y *= -1; // Reverse vertical direction when hitting top/bottom walls
        }
        this.x += this.speed; // Continue moving right
        this.y += this.speed * this.direction_y; // Adjust vertical position
      }
    }
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

  if (player_right.y + player_right.size > 20) {
    player_right.y = 8 - player_right.size;
  } else if (player_right.y < -8 + player_right.size) {
    player_right.y = -8 + player_right.size;
  }

  if (player_left.y + player_left.getheight() > 20) {
    player_left.y = 8 - player_left.getheight();
  } else if (player_left.y < -8) {
    player_left.y = -8;
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
            console.log("point pour gauche");
        }
        else return false; // Game over
    }
  }
  return true; // Game continues
}



// ----------------- ath function -----------------

const updateScore = function () {
  const playerLeftScore = document.getElementById('PLscore');
  const playerRightScore = document.getElementById('PRscore');

  // Only update if the score elements exist
  if (playerLeftScore && playerRightScore) {
    playerLeftScore.innerText = `Score: ${player_left.getScore()}`;
    playerRightScore.innerText = `Score: ${player_right.getScore()}`;
  }
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

    setup3D(ballSpeed, paddleSize, paddleSpeed) {
        const canvas = document.getElementById('pongCanvas');
        renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(canvas.width, canvas.height);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(100, canvas.width / canvas.height, 5, 100);
        camera.position.z = 10;
        camera.position.y = 0;

        // Initialize game objects
        player_left = new Player(-10, 0, 0, paddleSize, paddleSpeed, 'green');
        player_left.sceneADD(scene);

        player_right = new Player(10, 0, 0, paddleSize, paddleSpeed, 'blue');
        player_right.sceneADD(scene);

        balll = new ball(0, 0, 0, 1, 1, ballSpeed, 0.5, 'red');
        balll.sceneADD(scene);

        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);
        light.position.set(0, 0, 20);

        return true;
    }

    handleKeyDown(e) {
        if (e.code === 'ArrowUp') {
            player_right.moveUp();
        } else if (e.code === 'ArrowDown') {
            player_right.moveDown();
        } else if (e.code === 'KeyW') {
            player_left.moveUp();
        } else if (e.code === 'KeyS') {
            player_left.moveDown();
        }
    }

    handleKeyUp(e) {
        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            player_right.dy = 0;
        } else if (e.code === 'KeyW' || e.code === 'KeyS') {
            player_left.dy = 0;
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
        
        const pregameMenu = document.getElementById('pregame-menu');
        pregameMenu.style.display = 'block';

        // Message du gagnant
        const winner = player_left.getScore() > player_right.getScore() ? "Left Player" : "Right Player";
        const winnerMessage = document.createElement('div');
        winnerMessage.textContent = `${winner} Wins!`;
        winnerMessage.style.color = 'white';
        winnerMessage.style.fontSize = '24px';
        winnerMessage.style.marginBottom = '20px';
        pregameMenu.insertBefore(winnerMessage, pregameMenu.firstChild);

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
    const canvas = document.getElementById('pongCanvas');
    
    // Initialize game controls
    const game = new Game(ballSpeed, paddleSize, paddleSpeed);

    animate(game, winScore);
    return game;
}

pregame();