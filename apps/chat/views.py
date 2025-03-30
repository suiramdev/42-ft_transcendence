from django.shortcuts import render
from django.core.exceptions import PermissionDenied
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DirectMessage, BlockedUser
from .serializers import DirectMessageSerializer
from django.db import models
from django.contrib.auth import get_user_model
from .errors import ChatErrorCodes

# Create your views here.

class DirectMessageViewSet(viewsets.ModelViewSet):
    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_blocked(self, user, other_user_id):
        is_blocked = BlockedUser.objects.filter(
            (models.Q(user=user, blocked_user_id=other_user_id) |
             models.Q(user_id=other_user_id, blocked_user=user))
        ).exists()

        if is_blocked:
            raise PermissionDenied({
                "error": "Cannot interact with blocked user",
                "code": ChatErrorCodes.BLOCKED_USER
            })

        return False

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs.get('user_id')
        
        # Validate other user exists
        get_object_or_404(get_user_model(), id=other_user_id)
        
        # Check if blocked before returning messages
        self.check_blocked(user, other_user_id)
            
        return DirectMessage.objects.filter(
            (models.Q(sender=user, receiver_id=other_user_id) |
             models.Q(sender_id=other_user_id, receiver=user))
        ).order_by('timestamp')

    def perform_create(self, serializer):
        other_user_id = self.kwargs.get('user_id')
        
        # Check if blocked before creating message
        self.check_blocked(self.request.user, other_user_id)
            
        serializer.save(
            sender=self.request.user,
            receiver_id=other_user_id
        )

    @action(detail=False, methods=['post'])
    def block_user(self, request, user_id=None):
        BlockedUser.objects.get_or_create(
            user=request.user,
            blocked_user_id=user_id
        )

        return Response({"status": "user blocked"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def unblock_user(self, request, user_id=None):
        BlockedUser.objects.filter(
            user=request.user,
            blocked_user_id=user_id
        ).delete()

        return Response({"status": "user unblocked"}, status=status.HTTP_200_OK)
