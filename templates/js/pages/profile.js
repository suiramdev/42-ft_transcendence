import { Page } from '../core/Page.js';
import { updateUser, logout } from '../services/user.js';
import { windowManager } from '../components/windowManager.js';

const PROFILE_IMAGES = [
  'static/profiles/profile1.png',
  'static/profiles/profile2.png',
  'static/profiles/profile3.png',
  'static/profiles/profile4.png',
];

export class ProfilePage extends Page {
  constructor() {
    super('profile.html');
  }

  async mount(container) {
    // if no user -> register page
    if (!currentUser) {
      router.navigate('/register');
      return false;
    }

    try {
      const response = await fetch(`/static/templates/profile.html`);
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement de profile.html : ${response.statusText}`);
      }

      const htmlText = await response.text();
      console.log("Contenu HTML chargé :", htmlText);

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const formContent = doc.querySelector('#profile');

      windowManager.openWindow('Profil', formContent.outerHTML);

    } catch (error) {
      console.error("Erreur :", error);
    }

    await super.mount(container);

    // Gestion des événements
    this.handleEditNameFormSubmit();
    this.handleEditProfilePictureSubmit();
    this.handleLogoutButtonClick();

    return true;
  }

  /**
   * Render the current profile picture
   * @private
   */
  renderProfilePicture() {
    const profileImgPreview = document.getElementById('profile-picture-preview');

    if (profileImgPreview && currentUser) {
      profileImgPreview.src = currentUser.profilePicture || PROFILE_IMAGES[0]; // Met une image par défaut si aucune image n'est définie
      console.log(`Rendering profile picture: ${currentUser.profilePicture || PROFILE_IMAGES[0]}`);
    }
  }

  /**
   * Render the current alias
   * @private
   */
  renderAlias() {
    const currentAlias = document.getElementById('current-alias');

    if (currentAlias && currentUser) {
      currentAlias.textContent = `Pseudo : ${currentUser.alias}`;
      console.log(`Rendering alias: ${currentUser.alias}`);
    }
  }

  /**
   * Handle the edit name form submit event
   * @private
   */
  handleEditNameFormSubmit() {
    const editNameForm = document.getElementById('edit-name-form');

    if (editNameForm) {
      editNameForm.addEventListener('submit', event => {
        event.preventDefault();

        const newAlias = event.target['new-alias'].value;
        if (newAlias.trim() !== '') {
          updateUser({
            ...currentUser,
            alias: newAlias,
          });

          this.renderAlias();
        }
      });
    }
  }

  /**
   * Handle the edit profile picture form submit event
   * @private
   */
  handleEditProfilePictureSubmit() {
    const editProfilePictureForm = document.getElementById('edit-profile-picture-form');

    if (editProfilePictureForm) {
      editProfilePictureForm.addEventListener('submit', event => {
        event.preventDefault();

        const newProfilePicture = event.target['new-profile-picture'].value;
        updateUser({
          ...currentUser,
          profilePicture: newProfilePicture,
        });

        this.renderProfilePicture();
      });
    }
  }

  /**
   * Handle the logout button click event
   * @private
   */
  handleLogoutButtonClick() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        logout();
        router.navigate('/');
      });
    }
  }

  /**
   * Attach event listeners to the form
   */
  attachFormEvent() {
    // Logique supplémentaire si nécessaire pour attacher des événements
  }
}
