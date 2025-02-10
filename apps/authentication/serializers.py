from rest_framework import serializers
from apps.user.models import User

class FortyTwoOAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()