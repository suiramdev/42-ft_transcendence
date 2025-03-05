from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status 
from rest_framework.response import Response
from rest_framework import viewsets
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
            # Get first user as temporary solution (or create one if none exists)
            temp_user, created = User.objects.get_or_create(
                username='temp_user',
                defaults={
                    'nickname': 'Temporary User'
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
                'player1': temp_user.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
    # @action(detail=False, methods=['post'], url_path='me')
