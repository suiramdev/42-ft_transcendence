import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.tournament.models import Tournament
from apps.user.models import User
from apps.tournament.models import TournamentStatus

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
        self.tournament_group_name = f"tournament_{self.tournament_id}"
        
        # Get user from scope
        self.user = self.scope["user"] if "user" in self.scope else None

        await self.channel_layer.group_add(
            self.tournament_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Remove from the group
        await self.channel_layer.group_discard(
            self.tournament_group_name,
            self.channel_name
        )
        
        # Check if this was the last player and close tournament if needed
        if self.user and self.user.is_authenticated:
            tournament = await self.get_tournament()
            if tournament:
                # Get the player position in this tournament
                player_position = await self.get_player_position(tournament)
                
                if player_position:
                    # Notify other players about disconnect
                    await self.channel_layer.group_send(
                        self.tournament_group_name,
                        {
                            "type": "tournament_update",
                            "message": {
                                "type": "player_left",
                                "player": player_position,
                                "player_name": self.user.username
                            }
                        }
                    )
            tournament.status = TournamentStatus.CANCELLED
            tournament.save()
                    
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Handle different event types
        event_type = data.get('type', '')
        
        if event_type == 'player_joined':
            # Forward player join event to all connected clients
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "tournament_update",
                    "message": data
                }
            )
        elif event_type == 'start_tournament':
            # Additional validation could happen here
            # Only allow tournament creator to start the tournament
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "tournament_update",
                    "message": {
                        "type": "start_tournament"
                    }
                }
            )
        elif event_type == 'player_ready':
        # Forward player ready event to all connected clients
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "tournament_update",
                    "message": data
                }
            )
        elif event_type == 'match_ready':
            # Forward match ready event to all connected clients
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "tournament_update",
                    "message": data
                }
            )
        elif event_type == 'match_starting':
            # Forward match starting event to all connected clients
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "tournament_update",
                    "message": data
                }
            )  
        else:
            # Generic message forwarding
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "tournament_update",
                    "message": data
                }
            )

    # Receive message from tournament group
    async def tournament_update(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def get_tournament(self):
        try:
            return Tournament.objects.get(id=self.tournament_id)
        except Tournament.DoesNotExist:
            return None
            
    @database_sync_to_async
    def get_player_position(self, tournament):
        # Find which player position this user has (player1, player2, etc.)
        for i in range(1, 5):  # Assuming max 4 players
            player_field = f"player{i}"
            if hasattr(tournament, player_field) and getattr(tournament, player_field) == self.user:
                return f"player{i}"
        return None
