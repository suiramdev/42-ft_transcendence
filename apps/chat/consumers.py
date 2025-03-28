from channels.generic.websocket import AsyncWebsocketConsumer
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async

class DirectMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']

        # If the user is anonymous, close the connection
        if user.is_anonymous:
            print("Rejected connection for anonymous user")
            await self.close()
            return

        # If the user is authenticated, accept the connection
        print(f"User {user.id} connected")
        await self.accept()

    async def disconnect(self, close_code):
        user = self.scope['user']
        print(f"User {user.id} disconnected")
        # TODO: Handle disconnected user
        pass

    async def receive(self, text_data):
        user = self.scope['user']
        print(f"User {user.id} sent message: {text_data}")
        # TODO: Handle received message
        pass
