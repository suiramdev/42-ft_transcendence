import * as THREE from 'three';
console.log("game is loaded!");
const canvas = document.getElementById('pongCanvas');
// ----------------- Player Class -----------------

class Player {
    constructor(x, y, z, size, speed, color){
        this.restX = x;
        this.x = x;
        this.restY = y;
        this.y = y;
        this.z = z;
        this.size = size;
        this.height = size;
        this.hitbox = size + 0.4;
        this.speed = speed;
        this.dy = 0;
        this.color = color;
        this.scoreCount = 0;
    }
    sceneADD(scene){
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshPhongMaterial({ color: this.color });
        const cube = new THREE.Mesh(geometry, material);
        this.pCube = cube;
        cube.position.x = this.x;
        cube.position.y = this.y;
        cube.position.z = this.z;

        scene.add(cube);
    }
    
    getx(){
        return this.x;
    }

    gety(){
        return this.y;
    }

    getz(){
        return this.z;
    }

    getwidth(){
        return this.size;
    }

    getheight(){
        return this.size;
    }

    getHitBox(){
        return this.hitbox;
    }

    moveUp(){
        if (this.y + this.size < 8)
            this.dy += this.speed;
    }
    moveDown(){
        if (this.y > -8)
            this.dy -= this.speed;
    }

    incrementScore (){
        this.scoreCount += 1;
    }

    getScore(){
        return this.scoreCount;
    }

    resetPlayer(){
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

    constructor(x, y, z, width, height, speed, radius, color, player_size){
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

    sceneADD(scene){
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
    
        return ballRight >= playerLeft && ballLeft <= playerRight &&
               ballBottom >= playerTop && ballTop <= playerBottom;
    }
    
    
    isBallinYWall(){
        if (this.y + this.radius >= 8 || this.y - this.radius <= -8) {
            return true;
        }
        return false;
    }

    isBallinXWall(){
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
            if (this.isBallinPlayer(player_left.getx(), player_left.gety(), player_left.getwidth(), player_left.getheight())) {
                this.direction_x = 1;  // Reverse horizontal direction
                this.x = player_left.getx() + player_left.getwidth() + this.radius;  // Move ball just outside the paddle
            } else {
                if (this.isBallinYWall()) {
                    this.direction_y *= -1;  // Reverse vertical direction when hitting top/bottom walls
                }
                this.x -= this.speed;  // Continue moving left
                this.y += this.speed * this.direction_y;  // Adjust vertical position
            }
        } else if (this.direction_x === 1) {
            // Check collision with the right paddle
            if (this.isBallinPlayer(player_right.getx(), player_right.gety(), player_right.getwidth(), player_right.getheight())) {
                this.direction_x = -1;  // Reverse horizontal direction
                this.x = player_right.getx() - this.radius;  // Move ball just outside the paddle
            } else {
                if (this.isBallinYWall()) {
                    this.direction_y *= -1;  // Reverse vertical direction when hitting top/bottom walls
                }
                this.x += this.speed;  // Continue moving right
                this.y += this.speed * this.direction_y;  // Adjust vertical position
            }
        }
    }
    
    resetBall(xdir){
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

    if (player_right.y + player_right.size > 8) {
        player_right.y = 8 - player_right.size;
    } else if (player_right.y < -8 + player_right.size) {
        player_right.y = -8 + player_right.size;
    }    

    if (player_left.y + player_left.getheight() > 8) {
        player_left.y = 8 - player_left.getheight();
    } else if (player_left.y < -8) {
        player_left.y = -8;
    }

    player_right.pCube.position.y = player_right.y;
    player_left.pCube.position.y = player_left.y;

    balll.bSphere.position.x = balll.x;
    balll.bSphere.position.y = balll.y;
}

function checkXCollision(){
    if (balll.isBallinXWall()){
        if (balll.x < 0){
            player_right.incrementScore();
            balll.resetBall(-1);
        }else {
            player_left.incrementScore();
            balll.resetBall(1);
        }
        player_left.resetPlayer();
        player_right.resetPlayer();
        return true;
    }
    return false;
}

// ----------------- 3D setup -----------------

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.width, canvas.height);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, canvas.width / canvas.height, 5, 100);
camera.position.z = 6;

const geometry = new THREE.BoxGeometry();
const player_left = new Player(-10, 0, 0, 1, 0.2, 'green');
player_left.sceneADD(scene);

const player_right = new Player(10, 0, 0, 1, 0.2, 'blue');
player_right.sceneADD(scene);

const balll = new ball(0, 0, 0, 1, 1, 0.1, 0.4, 'red');
balll.sceneADD(scene);

const light = new THREE.PointLight('', 11111, 100);
scene.add(light);
light.position.set(0, 0, 20);

// ----------------- ath function -----------------

const updateScore = function(){
    document.getElementById('PLscore').innerText = `Score: ${player_left.getScore()}`;
    document.getElementById('PRscore').innerText = `Score: ${player_right.getScore()}`;
}

document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', stopPlayer);

function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect(); // Get canvas bounds
    const x = event.clientX - rect.left;         // Adjust X coordinate
    const y = event.clientY - rect.top;          // Adjust Y coordinate
    return { x: x, y: y };
}

const animate = function () {
    requestAnimationFrame(animate);
    if (!checkXCollision()){    
        updateScore();
        updatePos();
        balll.moveBall();
        renderer.render(scene, camera);
    }
};


animate();