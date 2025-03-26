from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserReadSerializer, UserUpdateSerializer
import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, FormParser

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'put', 'post', 'head', 'options']
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.request.method == 'PATCH' or self.request.method == 'PUT':
            return UserUpdateSerializer
        return UserReadSerializer

    def update(self, request, *args, **kwargs):
        """Handle PUT requests"""
        if str(request.user.id) != kwargs.get('pk'):
            return Response(
                {"detail": "You can only modify your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests"""
        if str(request.user.id) != kwargs.get('pk'):
            return Response(
                {"detail": "You can only modify your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'patch', 'put'], url_path='me')
    def me(self, request):
        """Get or update the currently authenticated user"""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        # PATCH or PUT request
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
