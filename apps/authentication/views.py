from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import FortyTwoOAuthSerializer
import os
from django.http import HttpResponseRedirect
import requests

class FortyTwoOAuthView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = FortyTwoOAuthSerializer

    @action(detail=False, methods=['get'], url_path='')
    def get(self, request):
        oauth_url = f"{os.getenv('AUTH_FORTY_TWO_OAUTH_URI')}?client_id={os.getenv('AUTH_FORTY_TWO_UID')}&redirect_uri={os.getenv('AUTH_FORTY_TWO_REDIRECT_URI')}&response_type=code"
        return HttpResponseRedirect(oauth_url)
    
    @action(detail=False, methods=['get'], url_path='callback')
    def callback(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response(
                {'error': 'No code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = {
            'grant_type': 'authorization_code',
            'client_id': os.getenv('AUTH_FORTY_TWO_UID'),
            'client_secret': os.getenv('AUTH_FORTY_TWO_SECRET'),
            'code': code,
        }

        response = requests.post(os.getenv('AUTH_FORTY_TWO_TOKEN_URI'), data=data)
        if response.status_code != 200:
            return Response(
                {'error': 'Failed to exchange code for token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')

        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token
        })
    
    def list(self, request):
        return Response({
            "endpoints": {
                "42": "/api/oauth/42/",
                "callback": "/api/oauth/42/callback/"
            }
        })