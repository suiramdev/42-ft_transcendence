from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserCreateSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_avatar(self, request, pk=None):
        user = self.get_object()
        if 'avatar' not in request.FILES:
            return Response(
                {'error': 'No avatar provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.avatar = request.FILES['avatar']
        user.save()
        return Response(UserSerializer(user).data)
