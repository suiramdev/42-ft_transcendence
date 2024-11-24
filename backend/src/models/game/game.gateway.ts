import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { GameMove, PaddleInput } from './game.types';

@WebSocketGateway()
export class GameGateway {
  @SubscribeMessage('paddleMove')
  handlePaddleMove(_client: WebSocket, _move: PaddleInput): void {
    // Validate and process the move
    // Update game state
    // Broadcast new positions to players
  }

  @SubscribeMessage('gameState')
  handleGameState(_client: WebSocket, _gameMove: GameMove): void {
    // Update and sync game state
  }
}
