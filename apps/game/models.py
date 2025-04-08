from django.db import models
from apps.user.models import User
from apps.tournament.models import Tournament

class Game(models.Model):
    """Records games between users"""
    player1 = models.ForeignKey(User, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='games_as_player2', on_delete=models.CASCADE, blank=True ,null=True)
    winner = models.ForeignKey(User, related_name='games_won', on_delete=models.CASCADE, blank=True, null=True)
    played_at = models.DateTimeField(auto_now_add=True)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    player_rdy = models.IntegerField(default=0)
    settings = models.JSONField(null=True, blank=True)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE,  blank=True, null=True)
    game_type = models.CharField(
        max_length=20,
        choices=[
            ('classic', 'Classic'),
            ('custom', 'Custom')
        ]
    )

    def getP1Score(self):
        return self.player1_score
    
    def getP2Score(self):
        return self.player2_score


    def addPlayerRdy(self):
        self.player_rdy += 1
        self.save()
        return self.player_rdy == 2
    
    def incrementWinner(self):
        self.winner.wins = self.winner.wins + 1
        self.winner.save()

        loser = self.player1 if self.winner == self.player2 else self.player2
        loser.losses = loser.losses + 1
        loser.save()

    def validate_and_store_settings(self, settings):
        """Validate and store game settings"""
        # Validate settings
        if not self._validate_settings(settings):
            return False
            
        self.settings = settings
        self.save()
        return True
        
    def check_settings_match(self):
        """Check if both players have matching settings"""
        if not self.settings:
            return False
            
        return True  # Add your settings comparison logic here
        
    def _validate_settings(self, settings):
        """Validate game settings"""
        required_settings = ['ballSpeed', 'paddleSize', 'paddleSpeed', 'ballSize', 'winScore']
        
        # Check if all required settings exist
        if not all(key in settings for key in required_settings):
            return False
            
        # Validate ranges
        validations = {
            'ballSpeed': (0.05, 0.3),
            'paddleSize': (2, 7),
            'paddleSpeed': (0.1, 0.4),
            'ballSize': (0.1, 1.5),
            'winScore': [3, 5, 7]
        }
        
        try:
            for key, validation in validations.items():
                value = float(settings[key])
                if isinstance(validation, (list, tuple)):
                    if isinstance(validation, tuple):
                        if value < validation[0] or value > validation[1]:
                            return False
                    else:
                        if value not in validation:
                            return False
            return True
        except (ValueError, TypeError):
            return False