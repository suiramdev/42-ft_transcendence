import { Page } from '../../core/Page.js';
import { getCookie } from '../../utils/cookies.js';
import { populateFriendsList } from '../../services/user.js';

export class UserProfilePage extends Page {
  /**
   * The user object
   *
   * @type {Object}
   */
  user;

  constructor() {
    super('profile/id.html', 'profile/id.css');
  }

  async beforeMount(params) {
    try {
      this.displayUser = await this._loadUser(params.id);
    } catch (error) {
      globalThis.router.back();
      return false;
    }

    return true;
  }

  async onMount() {
    await this._renderProfile();
  }

  async _loadUser(id) {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      throw new Error('Utilisateur non connecté');
    }

    const response = await fetch(`/api/user/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error('Profil introuvable');

    const user = await response.json();

    return user;
  }

  async _renderProfile() {
    document.querySelector('.profile__alias').textContent =
      this.displayUser.nickname ?? 'Utilisateur inconnu';
    document.querySelector('.profile__bio').textContent = this.displayUser.bio;
    document.querySelector('.profile__avatar-image').src =
      this.displayUser.avatar ?? '/static/images/avatars/duck.webp';

    // Calculate win rate
    const wins = this.displayUser.wins ?? 0;
    const losses = this.displayUser.losses ?? 0;
    const totalMatches = wins + losses;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : 0;

    // Dynamically update stats
    const statsContainer = document.querySelector('.profile__stats');
    statsContainer.innerHTML = `
    <div class="profile__stats-item">
      <span class="profile__stats-value">${wins}</span>
      <span class="profile__stats-label">Matchs gagnés</span>
    </div>
    <div class="profile__stats-item">
      <span class="profile__stats-value">${losses}</span>
      <span class="profile__stats-label">Matchs perdus</span>
    </div>
    <div class="profile__stats-item">
      <span class="profile__stats-value">${winRate}%</span>
      <span class="profile__stats-label">Win Rate</span>
    </div>
  `;
    document.querySelector('#message-btn').addEventListener('click', () => {
      globalThis.router.navigate(`/chat/${this.displayUser.id}`);
    });

    const isFriend = await this._checkFriendshipStatus();
    const removeFriendBtn = document.getElementById('remove_friend');
    const profileHeader = document.querySelector('.profile__header');

    const existingAddBtn = document.getElementById('add_friend');
    if (existingAddBtn) {
      existingAddBtn.remove();
    }

    if (isFriend) {
      if (removeFriendBtn) {
        removeFriendBtn.style.display = 'block';
        const newRemoveBtn = removeFriendBtn.cloneNode(true);
        removeFriendBtn.parentNode.replaceChild(newRemoveBtn, removeFriendBtn);
        newRemoveBtn.addEventListener('click', () => {
          this._removeFriend();
        });
      }
    } else {
      if (removeFriendBtn) {
        removeFriendBtn.style.display = 'none';
      }
      const addFriendBtn = document.createElement('button');
      addFriendBtn.id = 'add_friend';
      addFriendBtn.textContent = 'Add Friend';
      addFriendBtn.classList.add('profile__add-friend-btn');
      profileHeader.appendChild(addFriendBtn);

      addFriendBtn.addEventListener('click', () => {
        this._addFriend();
      });
    }
  }

  async _checkFriendshipStatus() {
    try {
      const accessToken = getCookie('access_token');
      if (!accessToken) {
        throw new Error('User not logged in');
      }

      // Get the current user's friends list
      const response = await fetch('/api/user/friends/', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends data');
      }

      // The response is an array of friends, not an object with a friends property
      const friends = await response.json();
      console.log('Friends list:', friends);

      // Check if the displayed user is in the friends list
      return Array.isArray(friends) && friends.some(friend => friend.id === this.displayUser.id);
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return false;
    }
  }

  async _removeFriend() {
    try {
      const accessToken = getCookie('access_token');
      if (!accessToken) {
        throw new Error('User not logged in');
      }
      const response = await fetch('/api/user/friend/remove/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.displayUser.nickname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove friend');
      }

      // Show success message
      alert('Friend removed successfully');
      this._renderProfile();
      populateFriendsList();
    } catch (error) {
      console.error('Error removing friend:', error);
      alert(error.message);
    }
  }

  async _addFriend() {
    try {
      const accessToken = getCookie('access_token');
      if (!accessToken) {
        throw new Error('User not logged in');
      }

      const response = await fetch('/api/user/friend/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.displayUser.nickname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add friend');
      }

      // Show success message
      alert('Friend added successfully');
      this._renderProfile();
      populateFriendsList();
    } catch (error) {
      console.error('Error adding friend:', error);
      alert(error.message);
    }
  }
}
