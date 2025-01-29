from rest_framework import serializers
from apps.user.models import User

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        # Set the nickname to the username by default
        validated_data['nickname'] = validated_data['username']
        return User.objects.create_user(**validated_data)

class SignInSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True) 