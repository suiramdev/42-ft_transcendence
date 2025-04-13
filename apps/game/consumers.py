import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.game.models import Game

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get the game ID from the URL route
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'
        
        # Join the game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Log connection for debugging
        print(f"WebSocket connected for game: {self.game_id}")

    async def disconnect(self, close_code):
        # Leave the game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected for game: {self.game_id}, code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(f"Received message: {data}")
            
            message_type = data.get('type', '')
            
            if message_type == 'player_joined':
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'player_joined',
                        'player': data.get('player', ''),
                        'game_id': data.get('game_id', '')
                    }
                )
            
            elif message_type == 'game-settings':
                # Forward game settings to other player
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_settings',
                        'settings': data.get('settings', {}),
                        'game_id': data.get('game_id', '')
                    }
                )

            elif message_type == 'ready':
                game_id = data.get('game_id', '')
                game_info = await self.get_game_info(game_id)
                # Mark player as ready
                both_ready = await self.mark_player_ready(game_id)
                
                # If both players are ready and settings match, start game
                if both_ready :
                    await self.channel_layer.group_send(
                        self.game_group_name,
                        {
                            'type': 'game_start',
                            'game_id': game_id,
                            'player_left_nickname': game_info['player_left_nickname'],
                            'player_right_nickname': game_info['player_right_nickname']
                        }
                    )
            
            elif message_type == 'player_move':
                # Forward player move message to the group
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'player_move',
                        'player': data.get('player', ''),
                        'direction': data.get('direction', '')
                    }
                )
            
            elif message_type == 'hit_ball':
                # Forward the hit ball message to the group
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'hit_ball',
                        'hit_position': data.get('hit_position', ''),
                        'direction': data.get('direction', ''),
                        'paddle_position': data.get('paddle_position', '')
                    }
                )
            
            # Add other message types as needed
            
        except json.JSONDecodeError:
            # Handle invalid JSON
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            print(f"Error processing message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    @database_sync_to_async
    def mark_player_ready(self, game_id):
        """Mark a player as ready and return True if both players are ready"""
        try:
            game = Game.objects.get(id=game_id)
            return game.addPlayerRdy()  # This updates and returns True if both players are ready
        except Game.DoesNotExist:
            return False

    # Add new message type handlers
    async def game_settings(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game-settings',
            'settings': event['settings'],
            'game_id': event['game_id']
        }))

    # Handler for player_joined messages
    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'player': event['player'],
            'game_id': event['game_id']
        }))

    # Handler for game_start messages
    async def game_start(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'game_start',
                'game_id': event['game_id'],
                'player_left_nickname': event['player_left_nickname'],
                'player_right_nickname': event['player_right_nickname']
            }))
            print(f"Sent game_start message for game: {event['game_id']}")
        except Exception as e:
            print(f"Error sending game_start: {str(e)}")

    # Handler for player_move messages
    async def player_move(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_move',
            'player': event['player'],
            'direction': event['direction']
        }))

    async def hit_ball(self, event):
        await self.send(text_data=json.dumps({
            'type': 'hit_ball',
            'hit_position': event['hit_position'],
            'direction': event['direction'],
            'paddle_position': event['paddle_position']
        }))
    @database_sync_to_async
    def get_game_info(self, game_id):
        """Get game information including player nicknames"""
        try:
            game = Game.objects.get(id=game_id)
            return {
                'player_left_nickname': game.player1.username if game.player1 else 'Player 1',
                'player_right_nickname': game.player2.username if game.player2 else 'Player 2'
            }
        except Game.DoesNotExist:
            return {
                'player_left_nickname': 'Player 1',
                'player_right_nickname': 'Player 2'
            }