import { Page } from '../core/Page.js';
import * as THREE from 'three';

class Paddle {
    constructor (x, z, width, height, speed, color){
        this.x = x;
        this.z = z;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
    }
    
    sceneADD(scene) {
        const geometry = new THREE.BoxGeometry(this.size, this.height, this.size);
        const material = new THREE.MeshPhongMaterial({ color: this.color });
        const cube = new THREE.Mesh(geometry, material);
        this.pCube = cube;
        cube.position.x = this.x;
        cube.position.z = this.z;

        scene.add(cube);
    }


}

class Ball {
    constructor(x, z, width, height, speed, radius, color) {
      this.x = x;
      this.z = z;
      this.width = width;
      this.height = height;
      this.speed = speed;
      this.radius = radius;
      this.color = color;
      this.direction_x = -1;
      this.direction_y = 1;
      this.isPregame = true;
    }

    sceneADD(scene) {
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: this.color });
        const sphere = new THREE.Mesh(geometry, material);
        this.bSphere = sphere;
        sphere.position.x = this.x;
        sphere.position.z = this.z;
        scene.add(sphere);
    }

}


export class Pregame {
    constructor(canva, type) {
        this.canva = canva;
        this.type = type; // 'ball', 'paddleSize', 'paddleSpeed', 'winScore'
        this.setup();
        this.createElements();
    }

    setup() {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canva });
        this.renderer.setSize(this.canva.width, this.canva.height);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, this.canva.width / this.canva.height, 5, 100);
        this.camera.position.z = 8;
        this.camera.position.y = 0;

        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 1, 2);
        this.scene.add(light);
    }

    createElements() {
        switch(this.type) {
            case 'ball':
                this.ball = new Ball(0, 0, 1, 1, 0.1, 0.5, 0xffffff);
                this.ball.sceneADD(this.scene);
                break;
            case 'paddleSize':
                this.paddle = new Paddle(0, 0, 1, 3, 0.1, 0x00ff00);
                this.paddle.sceneADD(this.scene);
                break;
            case 'paddleSpeed':
                this.paddle = new Paddle(-3, 0, 1, 2, 0.2, 0xff0000);
                this.paddle.sceneADD(this.scene);
                break;
            case 'winScore':
                // Créer une visualisation appropriée pour le score
                break;
        }
    }

    animate() {
        switch(this.type) {
            case 'ball':
                this.animateBall();
                break;
            case 'paddleSize':
                this.animatePaddleSize();
                break;
            case 'paddleSpeed':
                this.animatePaddleSpeed();
                break;
            case 'winScore':
                this.animateWinScore();
                break;
        }
        this.renderer.render(this.scene, this.camera);
    }

    updateSpeed(value) {
        if (this.type === 'ball') {
            this.ball.speed = parseFloat(value);
        } else if (this.type === 'paddleSpeed') {
            this.paddle.speed = parseFloat(value);
        }
    }

    updateSize(value) {
        if (this.type === 'paddleSize') {
            this.paddle.height = parseFloat(value);
            // Recreate paddle with new size
            this.scene.remove(this.paddle.pCube);
            this.paddle.sceneADD(this.scene);
        }
    }

    updateScore(value) {
        if (this.type === 'winScore') {
            this.winScore = parseInt(value);
        }
    }
}

let animations;
let isAnimating = true;

export function stopPregameAnimations() {
    isAnimating = false;
}

function setupEventListeners() {
    const ballSpeedInput = document.getElementById('ball-speed');
    const paddleSizeInput = document.getElementById('paddle-size');
    const paddleSpeedInput = document.getElementById('paddle-speed');
    const winScoreInput = document.getElementById('win-score');

    if (ballSpeedInput) {
        ballSpeedInput.addEventListener('input', (e) => {
            animations.ball.updateSpeed(e.target.value);
            document.getElementById('ball-speed-value').textContent = e.target.value;
        });
    }

    if (paddleSizeInput) {
        paddleSizeInput.addEventListener('input', (e) => {
            animations.paddleSize.updateSize(e.target.value);
            document.getElementById('paddle-size-value').textContent = e.target.value;
        });
    }

    if (paddleSpeedInput) {
        paddleSpeedInput.addEventListener('input', (e) => {
            animations.paddleSpeed.updateSpeed(e.target.value);
            document.getElementById('paddle-speed-value').textContent = e.target.value;
        });
    }

    if (winScoreInput) {
        winScoreInput.addEventListener('input', (e) => {
            animations.winScore.updateScore(e.target.value);
            document.getElementById('win-score-value').textContent = e.target.value;
        });
    }
}


function animate() {
    if (!isAnimating) {
        requestAnimationFrame(animate);
        Object.values(animations).forEach(anim => anim.animate());
    }
}

export function pregameSetup() {
    console.log("pregame start");
    const animations = {
        ball: new Pregame(document.getElementById("ball-speed-canva"), 'ball'),
        paddleSize: new Pregame(document.getElementById("paddle-size-canva"), 'paddleSize'),
        paddleSpeed: new Pregame(document.getElementById("paddle-speed-canva"), 'paddleSpeed'),
        winScore: new Pregame(document.getElementById("win-score-canva"), 'winScore')
    };
    setupEventListeners();
    animate();
}