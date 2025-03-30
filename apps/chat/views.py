from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DirectMessage
from .serializers import DirectMessageSerializer
from django.db import models

# Create your views here.

class DirectMessageViewSet(viewsets.ModelViewSet):
    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs.get('user_id')
        
        return DirectMessage.objects.filter(
            (models.Q(sender=user, receiver_id=other_user_id) |
             models.Q(sender_id=other_user_id, receiver=user))
        ).order_by('timestamp')

    def perform_create(self, serializer):
        other_user_id = self.kwargs.get('user_id')
        serializer.save(
            sender=self.request.user,
            receiver_id=other_user_id
        )

    @action(detail=False, methods=['get'])
    def conversation(self, request, user_id=None):
        messages = self.get_queryset()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
