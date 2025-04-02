import { Page } from '../core/Page.js';
import { getCookie } from '../utils/cookies.js';

export class UserProfilePage extends Page {
  constructor() {
    super('user-profile.html', 'user-profile.css');
  }

  async onMount(params) {
    await this.loadUserProfile(params.id);
  }

  async loadUserProfile(userId) {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      router.navigate('/');
      return;
    }

    try {
      // Récupérer l'utilisateur connecté
      const responseMe = await fetch('/api/user/me/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!responseMe.ok) throw new Error('Utilisateur non connecté');

      const currentUser = await responseMe.json();

      // Si l'ID demandé est celui du user connecté, charge `/api/user/me/`
      const url = userId == currentUser.id ? '/api/user/me/' : `/api/user/${userId}/`;

      // Récupérer les infos du profil
      const responseProfile = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!responseProfile.ok) throw new Error('Profil introuvable');

      const userProfile = await responseProfile.json();

      // ✅ Mise à jour de l'affichage
      document.querySelector('.profile__alias').textContent =
        userProfile.nickname ?? 'Utilisateur inconnu';
      document.querySelector('.profile__bio').textContent =
        userProfile.bio ?? 'Aucune bio renseignée.';
      document.querySelector('.profile__avatar-image').src =
        userProfile.avatar ?? '/static/images/avatars/duck.webp';
      document.querySelector('#user-id').textContent = userProfile.id;
    } catch (error) {
      console.error('Erreur :', error);
      router.navigate('/not-found');
    }
  }
}
