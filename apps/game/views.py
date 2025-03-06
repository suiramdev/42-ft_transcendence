from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status 
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.game.models import Game
from rest_framework.permissions import IsAuthenticated
from apps.user.models import User  # Import your custom User model

# Create your views here.
class gameViewset(viewsets.ViewSet):
    # We'll add authentication later
    # permission_classes = [IsAuthenticated]

    def create(self, request):
        """Handle POST /api/game"""
        try:
            # currentUser = request.user
            # print(f"user : {request.user}")
            # print(f"user : {request.user.id}")
            temp_user, created = User.objects.get_or_create(
                username='temp_player',
                defaults={
                    'nickname': 'player 1',
                }
            )
            
            game = Game.objects.create(
                player1=temp_user,
                player2=temp_user,
                winner=temp_user,
                player1_score=0,
                player2_score=0,
                game_type='classic'
            )
            
            return Response({
                'game_id': game.id,
                'status': 'created',
                'player1': temp_user.nickname
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['post'], url_path='join')
    def joinGame(self, request):
        """Handle POST /api/game/join"""
        try:
            gameID = request.headers.get('game-id')
            # userID = request.user.id
            print(f"gameID : {gameID}")
            temp_user, created = User.objects.get_or_create(
                username='temp_player',
                defaults={
                    'nickname': 'player 2',
                }
            )
            
            if not gameID: # or not userID
                return Response({
                    'error': 'Game ID and User ID are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            game = get_object_or_404(Game, id=gameID)
            print(f"game id if its found : {game.id}")
            # if game.player2 is not None:
            #     return Response({
            #         'error': 'Game is already full'
            #     }, status=status.HTTP_400_BAD_REQUEST)
            
            game.player2 = temp_user
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