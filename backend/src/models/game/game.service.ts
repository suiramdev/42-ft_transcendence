import { Injectable } from '@nestjs/common';
import { type GameState, GameStatus } from './game.types';

@Injectable()
export class GameService {
  private games = new Map<string, GameState>();

  createGame(playerOneId: string): GameState {
    const gameState: GameState = {
      id: crypto.randomUUID(),
      playerOne: {
        id: playerOneId,
        position: 50,
        score: 0,
      },
      playerTwo: {
        id: '',
        position: 50,
        score: 0,
      },
      ball: {
        x: 50,
        y: 50,
        velocityX: 0,
        velocityY: 0,
      },
      status: GameStatus.Waiting,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.games.set(gameState.id, gameState);
    return gameState;
  }

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  updateGame(
    gameId: string,
    updates: Partial<GameState>,
  ): GameState | undefined {
    const game = this.games.get(gameId);
    if (!game) return undefined;

    const updatedGame = {
      ...game,
      ...updates,
      updatedAt: new Date(),
    };

    this.games.set(gameId, updatedGame);
    return updatedGame;
  }
}
