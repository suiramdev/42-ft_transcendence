import { Page } from '../core/Page.js';
import { isLoggedIn } from '../services/user.js';
import { getUser } from '../services/user.js';

export class ProfilePage extends Page {
  constructor() {
    super('profile.html', 'profile.css');
  }

  async mount(container) {

    await getUser();

    if (!isLoggedIn()) {
      // If the user is not logged in, navigate to the home page
      router.navigate('/');
      return;
    }
    await super.mount(container);

    return true;
  }

  onMount() {
    this.renderProfilePicture();
    this.renderAlias();

    document.addEventListener('userStateChange', () => {
      if (!isLoggedIn()) {
        // If the user is not logged in, navigate to the home page
        router.navigate('/');
        return;
      }

      this.renderProfilePicture();
      this.renderAlias();
    });
  }

  renderProfilePicture() {
    const profilePicture = document.querySelector('.profile__avatar-image');
    if (profilePicture && globalThis.user) {
      profilePicture.src = globalThis.user.avatar || 'static/images/avatars/duck.webp';
    }
  }

  renderAlias() {
    const alias = document.querySelector('.profile__alias');
    if (alias && globalThis.user) {
      alias.textContent = globalThis.user.nickname || 'Utilisateur inconnu';
    }
  }
}
