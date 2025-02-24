import { Page } from '../core/Page.js';
import { isLoggedIn } from '../services/user.js';

export class ProfilePage extends Page {
  constructor() {
    super('profile.html', 'profile.css');
  }

  async mount(container) {
    if (!isLoggedIn()) {
      // If the user is not logged in, navigate to the home page
      router.navigate('/');
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
    if (profilePicture) {
      profilePicture.src = currentUser.profilePicture;
    }
  }

  renderAlias() {
    const alias = document.querySelector('.profile__alias');
    if (alias) {
      alias.textContent = currentUser.alias;
    }
  }
}
