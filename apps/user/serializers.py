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
            'ladder_level',
            'status',
            'bio',
        )

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('nickname', 'avatar', 'bio')
