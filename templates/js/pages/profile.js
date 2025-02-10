import { Page } from '../core/Page.js';
import { updateUser, logout } from '../services/user.js';

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

  /**
   * Render the current profile picture
   * @private
   */
  renderProfilePicture() {
    const profileImgPreview = document.getElementById('profile-picture-preview');

    profileImgPreview.src = currentUser.profilePicture;
  }

  /**
   * Render the current alias
   * @private
   */
  renderAlias() {
    const currentAlias = document.getElementById('current-alias');

    currentAlias.textContent = `Pseudo : ${currentUser.alias}`;
  }

  /**
   * Handle the edit name form submit event
   * @private
   */
  handleEditNameFormSubmit() {
    const editNameForm = document.getElementById('edit-name-form');

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

  /**
   * Handle the edit profile picture form submit event
   * @private
   */
  handleEditProfilePictureSubmit() {
    const editProfilePictureForm = document.getElementById('edit-profile-picture-form');

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

  /**
   * Handle the logout button click event
   * @private
   */
  handleLogoutButtonClick() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
      logout();
      router.navigate('/');
    });
  }

  async mount(container) {
    // If the user is not logged in, redirect to the register page
    if (!currentUser) {
      router.navigate('/register');
      return false;
    }

    await super.mount(container);

    // Add any page-specific initialization here
    this.renderProfilePicture();
    this.renderAlias();

    this.handleEditNameFormSubmit();
    this.handleEditProfilePictureSubmit();
    this.handleLogoutButtonClick();
    return true;
  }
}
