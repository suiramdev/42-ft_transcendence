import { Page } from '../core/Page.js';
import { PROFILE_IMAGES } from '../config/constants.js';

export class ProfilePage extends Page {
  constructor() {
    super('profile.html');
  }

  /**
   * Populate the profile image select with the available profile images
   */
  populateProfileImageSelect() {
    const select = document.getElementById('new-profile-img');
    PROFILE_IMAGES.forEach((img, idx) => {
      const option = document.createElement('option');
      option.value = img;
      option.textContent = `Image ${idx + 1}`;
      select.appendChild(option);
    });
  }

  eventListeners() {
    const editNameButton = document.getElementById('edit-name-button');
    if (editNameButton) {
      editNameButton.addEventListener('click', () => {
        this.editNameSection.style.display =
          this.editNameSection.style.display === 'none' ? 'block' : 'none';
      });
    }

    const editNameSection = document.getElementById('edit-name-section');
    if (editNameSection) {
      editNameSection.style.display = editNameSection.style.display === 'none' ? 'block' : 'none';
    }

    const editNameForm = document.getElementById('edit-name-form');
    if (editNameForm) {
      editNameForm.addEventListener('submit', event => {
        event.preventDefault();
        const newAlias = document.getElementById('new-alias').value;
        if (newAlias) {
          currentUser.alias = newAlias;
          alert('Pseudo mis à jour avec succès !');
          updateUserInfo();
          setupProfilePage();
        }
      });
    }
  }

  // Override mount to add custom behavior
  async mount(container) {
    await super.mount(container);
    // Add any page-specific initialization here
    this.populateProfileImageSelect();
    return true;
  }
}
