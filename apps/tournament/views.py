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


class tournamentViewset(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        """handle POST /api/tournament/create"""
        tournament = Tournament.objects.create(
            player1 = request.user,
            player2 = None,
            player3 = None,
            player4 = None,
        )

        return Response({
            'tournament_id': tournament.id,
            'status': 'created',
            'player1': request.user.nickname
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """handle POST /api/tournament/join"""
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
        
        # Track which position this player joined as
        joined_position = None
        
        if tournament.player2 == None:
            tournament.player2 = request.user
            joined_position = 2
        elif tournament.player3 == None:
            tournament.player3 = request.user
            joined_position = 3
        elif tournament.player4 == None:
            tournament.player4 = request.user
            joined_position = 4
        else:
            return Response({
                'error': 'Tournament is full'
            }, status=status.HTTP_400_BAD_REQUEST) 
        
        tournament.save()
        
        # Create a response with all current players
        response_data = {
            'tournament_id': tournament.id,
            'status': 'joined',
            'joined_as': f'player{joined_position}',
            'players': {
                'player1': tournament.player1.nickname,
            }
        }
        
        # Add any other players that exist
        if tournament.player2:
            response_data['players']['player2'] = tournament.player2.nickname
        if tournament.player3:
            response_data['players']['player3'] = tournament.player3.nickname
        if tournament.player4:
            response_data['players']['player4'] = tournament.player4.nickname
        
        # Add a count of players and flag if tournament is full
        player_count = sum(1 for p in [tournament.player1, tournament.player2, tournament.player3, tournament.player4] if p is not None)
        response_data['player_count'] = player_count
        response_data['is_full'] = player_count == 4
        
        return Response(response_data, status=status.HTTP_200_OK)

