from rest_framework import serializers
from .models import User

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'nickname',
            'avatar',
            'coalition',
            'wins',
            'losses',
            'status',
            'bio',
        )

class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)  # Ensure avatar is handled as an image field

    class Meta:
        model = User
        fields = ('nickname', 'avatar', 'bio')
