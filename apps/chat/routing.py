from django.urls import re_path
from channels.routing import URLRouter
from .middleware import ChatAuthMiddleware
from .consumers import DirectMessageConsumer

chat_urlpatterns = [
    re_path(r'^', ChatAuthMiddleware(
        URLRouter([
            re_path(r'^', DirectMessageConsumer.as_asgi()),
        ])
    )),
]