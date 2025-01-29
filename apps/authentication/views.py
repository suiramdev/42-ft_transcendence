from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from .serializers import SignUpSerializer, SignInSerializer
from apps.user.serializers import UserReadSerializer

class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'signup':
            return SignUpSerializer
        return SignInSerializer

    @action(detail=False, methods=['post'])
    def signup(self, request):
        """Handle user registration"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Authenticate the user right after signup
            authenticated_user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if authenticated_user:
                login(request, authenticated_user)
            return Response(
                UserReadSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['post'])
    def signin(self, request):
        """Handle user authentication"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                login(request, user)
                return Response(UserReadSerializer(user).data)
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def list(self, request):
        return Response({
            "endpoints": {
                "signup": "/api/auth/signup/",
                "signin": "/api/auth/signin/"
            }
        })
