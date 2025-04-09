from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status 
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.game.models import Game
from rest_framework.permissions import IsAuthenticated
from apps.user.models import User
from rest_framework import permissions
from apps.tournament.models import Tournament
# Create your views here.
class tournamentViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        tournament = Tournament.object.create(
            player1 = request.user,
            player2 = None,
            player3 = None,
            player4 = None,
            winner = None,
        )
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        tournament_id = request.data.get('tournamentId')

        if not tournament_id:
            return Response({
                'error': 'Tournament ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({
                'error': 'Tournament not found'
            }, status=status.HTTP_404_NOT_FOUND)
    