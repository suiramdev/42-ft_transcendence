import { Page } from '../core/Page.js';

export class UserProfilePage extends Page {
  constructor() {
    super('users.html', 'users.css');
    this.userData = null;
  }

  async fetchUserProfile(userId) {
    try {
      const response = await fetch(`/api/user/${userId}/`);
      if (!response.ok) {
        throw new Error("Impossible de récupérer les données de l'utilisateur");
      }
      this.userData = await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération du profil :', error);
    }
  }

  updateProfileUI() {
    if (!this.userData) return;

    document.querySelector('.profile__avatar img').src =
      this.userData.avatar || '/static/images/avatars/default.png';
    document.querySelector('.profile__alias').textContent = this.userData.username;
    document.querySelector('.profile__bio').textContent = this.userData.bio || 'Aucune bio.';

    // Masquer le bouton "Modifier le profil" si ce n'est pas l'utilisateur connecté
    const editButton = document.querySelector('.profile__edit-btn');
    if (globalThis.user && globalThis.user.id === this.userData.id) {
      editButton.style.display = 'block';
    } else {
      editButton.style.display = 'none';
    }
  }

  async onMount(params) {
    await this.fetchUserProfile(params.id);
    this.updateProfileUI();
  }
}
