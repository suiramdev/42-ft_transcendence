from django.db import models
from apps.user.models import User

class Game(models.Model):
    """Records games between users"""
    player1 = models.ForeignKey(User, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='games_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(User, related_name='games_won', on_delete=models.CASCADE)
    played_at = models.DateTimeField(auto_now_add=True)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    game_type = models.CharField(
        max_length=20,
        choices=[
            ('classic', 'Classic'),
            ('custom', 'Custom')
        ]
    )

    def save(self, *args, **kwargs):
        if not self.pk:
            self.winner.wins = self.winner.wins + 1
            self.winner.save()
            
            loser = self.player1 if self.winner == self.player2 else self.player2
            loser.losses = loser.losses + 1
            loser.save()
            
        super().save(*args, **kwargs)