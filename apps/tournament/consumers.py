import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from apps.tournament.models import Tournament
from apps.user.models import User

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
        await self.channel_layer.group_discard(
            self.tournament_group_name,
            self.channel_name
        )
        
        #TODO : proper disconnect handler, notify other players
        # that someone left the tournament

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