from django.db import models
from apps.user.models import User

class Tournament(models.Model):

    player1 = models.ForeignKey(User, related_name='tournament_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='tournament_as_player2', on_delete=models.CASCADE, blank=True ,null=True)
    player3 = models.ForeignKey(User, related_name='tournament_as_player3', on_delete=models.CASCADE, blank=True ,null=True)
    player4 = models.ForeignKey(User, related_name='tournament_as_player4', on_delete=models.CASCADE, blank=True ,null=True)
    played_at = models.DateTimeField(auto_now_add=True)
