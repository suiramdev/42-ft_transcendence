import { Router } from './core/Router.js';
import { HomePage } from './pages/home.js';
import { TournamentPage } from './pages/tournament.js';
import { GamePage } from './pages/game.js';
import { ProfilePage } from './pages/profile.js';
import { RegisterPage } from './pages/register.js';
import { getUserData } from './services/user.js';

// Get user data from localStorage
const { alias, profilePicture } = getUserData();

// Update the dropdown menu with the user data
const profilePicElement = document.getElementById('profile-pic');
const usernameElement = document.getElementById('username');

if (profilePicElement && usernameElement) {
  profilePicElement.src = profilePicture;  // Set the profile picture
  usernameElement.textContent = alias;     // Set the username
}

// Initialize the router in globalThis
// so it can be accessed from anywhere in the code
globalThis.router = null;

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  const router = new Router(rootElement);
  const startButton = document.querySelector('.start-button');
  const dropdownMenu = document.getElementById('dropdown-menu');

  // Register the routes
  router.registerRoute('/', new HomePage());
  router.registerRoute('/tournament', new TournamentPage());
  router.registerRoute('/game', new GamePage());
  router.registerRoute('/profile', new ProfilePage());
  router.registerRoute('/register', new RegisterPage());

  globalThis.router = router;
  
  // Handle the dropdown menu visibility
  if (startButton && dropdownMenu) { // gestion du menu déroulant
    startButton.addEventListener('click', () => {
      dropdownMenu.classList.toggle('visible');
      updateDropdownMenu(); // Mise à jour du menu à chaque ouverture
    });

    document.addEventListener('click', (event) => {
      if (!startButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove('visible');
      }
    });
  }

  // Charger la page actuelle si l'URL a un hash
  if (location.pathname !== '/') {
    router.navigate(location.pathname);
  }

  // Mise à jour dynamique du menu déroulant
  function updateDropdownMenu() {
    if (dropdownMenu) {
      const userNameElement = dropdownMenu.querySelector('#user-name');
      const profileImageElement = dropdownMenu.querySelector('#profile-image');

      if (userNameElement && profileImageElement) {
        userNameElement.textContent = currentUser.alias; // Affiche le pseudo
        profileImageElement.src = currentUser.profilePicture || 'static/profiles/profile1.png'; // Affiche l'image de profil
      }
    }
  }

  // Mettre à jour le menu au chargement de la page
  updateDropdownMenu();
});
