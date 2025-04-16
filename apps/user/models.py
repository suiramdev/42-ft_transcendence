from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model extending Django's built-in User"""
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    nickname = models.CharField(max_length=50, unique=True)
    bio = models.CharField(max_length=255, null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    coalition = models.CharField(max_length=50, null=True, blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    ladder_level = models.IntegerField(default=0)
    friends = models.ManyToManyField("self", related_name='user_friends', symmetrical=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('online', 'Online'),
            ('offline', 'Offline'),
            ('in_game', 'In Game')
        ],
        default='offline'
    )

    """Custom user model extending Django's built-in User"""
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    def __str__(self):
        return self.nickname or self.username

    def get_friends(self):
        """Get all friends for the user"""
        return self.friends.all()

    def get_nick(self):
        return self.nickname

    def get_achievements(self):
        """Get all achievements for the user"""
        return self.achievements.all()

    def get_games(self):
        """Get all games for the user"""
        return (self.games_as_player1.all() |
                self.games_as_player2.all()).distinct()

    def get_stats(self):
        """Get user's game statistics"""
        total_games = self.wins + self.losses
        win_rate = (self.wins / total_games * 100) if total_games > 0 else 0

        return {
            'wins': self.wins,
            'losses': self.losses,
            'total_games': total_games,
            'win_rate': win_rate
        }

class Achievement(models.Model):
    """Model for defining possible achievements"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='achievements/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """Tracks which users have earned which achievements"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    achieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')


class Friendship(models.Model):
    """Manages friend relationships between users"""
    from_user = models.ForeignKey(User, related_name='friendships_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friendships_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('blocked', 'Blocked')
        ],
        default='pending'
    )

    class Meta:
        unique_together = ('from_user', 'to_user')
