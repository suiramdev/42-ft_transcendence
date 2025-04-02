import { Page } from '../../core/Page.js';
import { getCookie } from '../../utils/cookies.js';

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
  }
}
