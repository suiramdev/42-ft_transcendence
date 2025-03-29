from django.urls import re_path
from . import consumers

# Define the WebSocket URL patterns for the game app here
websocket_urlpatterns = [
    # Format: ws/game/<game_id>/
    # Example: ws/game/room1/
    # This will match any room name and pass it to the GameConsumer
    re_path(r'ws/game/(?P<game_id>\w+)$', consumers.GameConsumer.as_asgi()),
]