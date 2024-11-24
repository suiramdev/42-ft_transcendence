import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { ChatMessage } from './chat.types';

@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(_client: WebSocket, _payload: ChatMessage): void {
    // Handle chat messages
  }
}
