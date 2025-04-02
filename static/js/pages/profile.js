import { Page } from '../core/Page.js';
import { isLoggedIn, getUser, updateUser } from '../services/user.js';

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

    this.setupEditProfile(); // Ajout de la gestion de l'édition du profil

    return true;
  }

  onMount() {
    this.renderProfilePicture();
    this.renderAlias();
    this.renderBio(); // Ajout de l'affichage de la bio

    document.addEventListener('userStateChange', () => {
      // TODO: Probably remove this with next load user changes
      if (!isLoggedIn()) {
        // If the user is not logged in, navigate to the home page
        router.navigate('/');
        return;
      }

      this.renderProfilePicture();
      this.renderAlias();
      this.renderBio(); // Mise à jour de la bio après un changement d'état
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

  // Fonction pour afficher la bio de l'utilisateur
  renderBio() {
    const bio = document.querySelector('.profile__bio');
    if (bio && globalThis.user) {
      bio.textContent =
        globalThis.user.bio ||
        'Slt tt le monde! Mwa g 2 koi vs rakonT... Jss 1 gro fan 2 pong é g kiff tro joué! Jfé ossi d la prog mé c pa tjs fassil mdr ^^ Vné mfèr 1 pti coucou si vs voulé! Bizzzoux <3';
    }
  }

  // Fonction pour gérer l'édition du profil
  setupEditProfile() {
    const editBtn = document.querySelector('.profile__edit-btn');
    const editForm = document.querySelector('.profile__edit-form');
    const aliasInput = document.querySelector('.profile__edit-alias');
    const bioInput = document.querySelector('.profile__edit-bio');
    const avatarSelect = document.querySelector('.profile__edit-avatar');
    const saveBtn = document.querySelector('.profile__save-btn');
    const cancelBtn = document.querySelector('.profile__cancel-btn');

    if (globalThis.user) {
      aliasInput.value = globalThis.user.nickname || '';
      bioInput.value = globalThis.user.bio || '';
    }

    editBtn.addEventListener('click', () => {
      editForm.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
      editForm.classList.add('hidden');
    });

    saveBtn.addEventListener('click', async () => {
      try {
        await updateUser({
          nickname: aliasInput.value,
          bio: bioInput.value,
          avatar: avatarSelect.files[0] || globalThis.user.avatar,
        });
        document.dispatchEvent(new Event('userStateChange'));
        editForm.classList.add('hidden');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil :', error);
      }
    });
  }
}
