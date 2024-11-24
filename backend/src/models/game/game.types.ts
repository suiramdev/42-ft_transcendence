export interface GameState {
  id: string;
  playerOne: {
    id: string;
    position: number;
    score: number;
  };
  playerTwo: {
    id: string;
    position: number;
    score: number;
  };
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
  };
  status: GameStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum GameStatus {
  Waiting = 'WAITING',
  Playing = 'PLAYING',
  Paused = 'PAUSED',
  Finished = 'FINISHED',
}

export interface GameSettings {
  ballSpeed: number;
  paddleSize: number;
  maxScore: number;
}

export interface GameMove {
  playerId: string;
  paddlePosition: number; // Y position of the paddle
  timestamp: number; // For move validation and synchronization
}

// You might also want to define specific move directions
export enum PaddleDirection {
  Up = 'UP',
  Down = 'DOWN',
  Stop = 'STOP',
}

// And a type for move input
export interface PaddleInput {
  playerId: string;
  direction: PaddleDirection;
}
