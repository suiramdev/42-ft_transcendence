from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import DirectMessage, BlockedUser
import datetime
from django.db import models
from .errors import ChatErrorCodes
import logging

logger = logging.getLogger(__name__)

class DirectMessageConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Get the user_id from the URL route
        self.other_user_id = self.scope['url_route']['kwargs']['id']
        self.user = self.scope['user']

        logger.info(f"User: {self.user.id if self.user else 'None'} is connecting to {self.other_user_id} chat")

        # First accept the connection
        await self.accept()

        if not self.user.is_authenticated:
            logger.info(f"User: {self.user.id if self.user else 'None'} is not authenticated, closing connection")
            await self.close(code=4001)
            return

        # Create a unique room name for these two users
        # Sort IDs to ensure same room name regardless of who initiates
        users = sorted([str(self.user.id), str(self.other_user_id)])
        self.room_name = f"dm_{users[0]}_{users[1]}"
           
        # Then join the room
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )

        logger.info(f"User: {self.user.id} joined room {self.room_name}")

    async def disconnect(self, close_code):
        # Leave room
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )

    async def receive_json(self, content):
        # Check for blocks before processing message
        is_blocked = await self.check_blocked()
        if is_blocked:
            logger.info(f"User: {self.user.id} is blocked by {self.other_user_id}, sending error")
            await self.send_json({
                'type': 'error',
                'error': 'You have or have been blocked by this user, you cannot send messages to them',
                'code': ChatErrorCodes.UNAUTHORIZED
            })
            return
            
        # Handle received message
        message = content.get('message', '')
        if not message or not message.strip():
            logger.info(f"User: {self.user.id} sent empty message, sending error")
            await self.send_json({
                'type': 'error',
                'error': 'Message cannot be empty',
                'code': ChatErrorCodes.INVALID_MESSAGE
            })
            return
            
        # Save message to database
        await self.save_message(message)
        logger.info(f"User: {self.user.id} saved message to database")
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'message',
                'message': message,
                'sender_id': self.user.id,
                'timestamp': str(datetime.datetime.now())
            }
        )

        logger.info(f"User: {self.user.id} sent message to room {self.room_name}")

    @database_sync_to_async
    def save_message(self, message):
        DirectMessage.objects.create(
            sender=self.user,
            receiver_id=self.other_user_id,
            content=message
        )

    @database_sync_to_async
    def check_blocked(self):
        return BlockedUser.objects.filter(
            (models.Q(user=self.user, blocked_user_id=self.other_user_id) |
             models.Q(user_id=self.other_user_id, blocked_user=self.user))
        ).exists()

    async def message(self, event):
        await self.send_json({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp']
        })
