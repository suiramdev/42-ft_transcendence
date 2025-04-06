from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponseRedirect
from apps.user.models import User
from .serializers import AuthSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import os
import requests
import logging
logger = logging.getLogger(__name__)


class FortyTwoAuthView(viewsets.ViewSet):
    """Authentication view for 42"""
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthSerializer

    def get_forty_two_access_token(self, code):
        """Get access token from 42 API using the authorization code"""
        data = {
            'grant_type': 'authorization_code',
            'client_id': os.getenv('AUTH_FORTY_TWO_UID'),
            'client_secret': os.getenv('AUTH_FORTY_TWO_SECRET'),
            'code': code,
        }

        token_uri = f"{os.getenv('AUTH_FORTY_TWO_TOKEN_URI')}?client_id={os.getenv('AUTH_FORTY_TWO_UID')}&client_secret={os.getenv('AUTH_FORTY_TWO_SECRET')}&code={code}&redirect_uri={os.getenv('AUTH_FORTY_TWO_REDIRECT_URI')}"
        print(token_uri)
        response = requests.post(token_uri, data=data)
        print(response.json())
        if response.status_code != 200:
            raise Exception('Failed to exchange code for token')

        return response.json().get('access_token')

    def get_forty_two_user(self, access_token):
        """Get user info from 42 API using the access token"""
        user_uri = f"{os.getenv('AUTH_FORTY_TWO_USER_URI')}"
        response = requests.get(user_uri, headers={'Authorization': f'Bearer {access_token}'})
        if response.status_code != 200:
            raise Exception('Failed to get user info')

        return response.json()

    @action(detail=False, methods=['get'], url_path='authorize')
    def authorize(self, request):
        """Retourne l'URL d'autorisation 42"""
        oauth_uri = f"{os.getenv('AUTH_FORTY_TWO_OAUTH_URI')}?client_id={os.getenv('AUTH_FORTY_TWO_UID')}&redirect_uri={os.getenv('AUTH_FORTY_TWO_REDIRECT_URI')}&response_type=code"
        return Response({'redirect_url': oauth_uri})  # On envoie l'URL au frontend

    @action(detail=False, methods=['get'], url_path='callback')
    def callback(self, request):
        """Callback from 42 OAuth authorization page"""
        code = request.query_params.get('code')

        logger.info(f"🟡 Callback reçu avec code: {code}") #debug

        if not code:
            logger.error("🔴 Aucun code reçu dans la requête OAuth.")
            return Response(
                {'error': 'No code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get OAuth tokens and user info
            forty_two_access_token = self.get_forty_two_access_token(code)
            logger.info(f"🟢 Token 42 reçu: {forty_two_access_token}")

            forty_two_user = self.get_forty_two_user(forty_two_access_token)
            logger.info(f"🟢 Utilisateur 42 reçu: {forty_two_user}")

            user = User.objects.filter(username=forty_two_user['login']).first()
            if not user:
                # Get or create user
                user = User.objects.create_user(
                    username=forty_two_user['login'],
                    email=forty_two_user['email'],
                    first_name=forty_two_user['first_name'],
                    last_name=forty_two_user['last_name'],
                    nickname=forty_two_user['login'],  # Default nickname to 42 login
                )
                logger.info(f"🟢 Nouvel utilisateur créé: {user.username}")
            else:
                user.email = forty_two_user['email']
                user.first_name = forty_two_user['first_name']
                user.last_name = forty_two_user['last_name']
                user.save()
                logger.info(f"🟢 Utilisateur mis à jour: {user.username}")


            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            # Redirect to frontend with access and refresh tokens
            response = HttpResponseRedirect('/profile')

            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                secure=False,
                samesite='Lax',
                max_age=3600  # 1 hour
            )

            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=7 * 24 * 60 * 60  # 7 days
            )

            return response

        except Exception as e:
            logger.error(f"🔴 Erreur dans callback: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class AuthView(viewsets.ViewSet):
    """Default authentication view"""
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthSerializer

    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh(self, request):
        """Refresh JWT tokens"""
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            if refresh.is_expired():
                return Response({'error': 'Refresh token expired'}, status=status.HTTP_400_BAD_REQUEST)

            user = refresh.user
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': refresh.access_token,
                'refresh': refresh,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

