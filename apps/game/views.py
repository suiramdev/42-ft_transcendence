from rest_framework import viewsets
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status 
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.game.models import Game
from rest_framework.permissions import IsAuthenticated
from apps.user.models import User


class gameViewset(viewsets.ViewSet):
    def create(self, request):
        """Handle POST /api/game/"""
        try:
            # Create temporary user for testing
            temp_user, created = User.objects.get_or_create(
                username='temp_player',
                defaults={
                    'nickname': 'Temporary Player'
                }
            )
            
            game = Game.objects.create(
                player1=temp_user,
                player2=temp_user,  # Temporarily set to same user
                winner=temp_user,   # Temporarily set
                player1_score=0,
                player2_score=0,
                game_type='classic'
            )
            
            return Response({
                'game_id': game.id,
                'status': 'created',
                'player1': temp_user.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """Handle POST /api/game/join/"""
        try:
            # Get the game ID from the request data
            game_id = request.data.get('gameId')
            
            if not game_id:
                return Response({
                    'error': 'Game ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create temporary user for player 2
            player2, created = User.objects.get_or_create(
                username='player2',
                defaults={
                    'nickname': 'Player 2'
                }
            )
            
            # Find the game
            try:
                game = Game.objects.get(id=game_id)
            except Game.DoesNotExist:
                return Response({
                    'error': 'Game not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Update the game with player 2
            game.player2 = player2
            game.save()
            
            return Response({
                'game_id': game.id,
                'status': 'joined',
                'player1': game.player1.nickname,
                'player2': game.player2.nickname,
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)