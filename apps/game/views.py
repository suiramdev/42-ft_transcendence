from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.game.models import Game


# Create your views here.
class gameViewset(viewsets.ViewSet):

    @action(detail=False, methods=['post', 'get'], url_path='me')     
    def test(self, request):
        

        return Response("test")