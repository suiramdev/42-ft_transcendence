document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('main-content');
  const startButton = document.querySelector('.start-button');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const navLinks = dropdownMenu.querySelectorAll('a');
  const homeButton = document.querySelector('.home-button');

  let currentUser = null; // Utilisateur connecté

  // Pages HTML
  const pages = {
    home: `
      <section id="home" class="active">
        <h2>Bienvenue au Pong Game</h2>
        <div class="gif-border">
          <img src="static/Windows.jpg" alt="Pong Game GIF">
        </div>
      </section>
    `,
    register: `
      <section id="register">
        <h2>Inscription</h2>
        <form id="registration-form">
          <label for="alias">Alias :</label>
          <input type="text" id="alias" name="alias" required>
          <button class="button-54" type="submit">S'inscrire</button>
        </form>
      </section>
    `,
    tournament: `
      <section id="tournament">
        <h2>Tournoi</h2>
        <p>Aucun tournoi en cours.</p>
      </section>
    `,
    game: `
      <section id="game">
        <h2>Jeu Pong</h2>
        <canvas id="pongCanvas" width="800" height="600"></canvas>
      </section>
    `,
    // J'ai pas pu check si c'etait correct le profil ou les autres pas CA SAFFICHE PAS
    profile: `
      <section id="profile">
        <h2>Votre Profil</h2>
        <div class="profile-section">
        <div id="profile-info">
                        <img id="profile-img-preview" src="" class="profile-img" alt="Profile Image">
                        <p><span id="current-alias"></span></p>
        </div>
        <button id="edit-name-button" class="button-54" style="display:none;">Modifier le pseudo</button>
        <div id="edit-name-section" style="display: none;">
            <form id="edit-name-form">
                <label for="new-alias">Nouveau pseudo :</label>
                <input type="text" id="new-alias" name="new-alias">
                <button class="button-54" type="submit">Valider</button>
            </form>
        </div>
        <button id="edit-photo-button" class="button-54" style="display:none;">Modifier la photo</button>
        <div id="edit-photo-section" style="display: none;">
          <form id="edit-photo-form">
              <label for="new-profile-img">Nouvelle image :</label>
              <select id="new-profile-img">
              </select>
                    <button class="button-54" type="submit">Valider</button>
                </form>
            </div>
            <button id="logout-button" class="button-54">Délog</button>
        </div>
    </section>
        `,
  };

  // Fonction pour afficher une page
  function changePage(page) {
    if (!pages[page]) page = 'home'; // Sécurité si la page n'existe pas
    mainContent.innerHTML = pages[page];
    history.pushState({}, '', `#${page}`);
    setupPageEvents(page);
  }

  // Gestion du menu déroulant
  startButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('visible');
  });

  document.addEventListener('click', (event) => {
    if (!startButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('visible');
    }
  });

  // Navigation via le menu ?
  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const page = link.dataset.page;
      changePage(page);
      dropdownMenu.classList.remove('visible');
    });
  });

  // Bouton Accueil
  homeButton.addEventListener('click', () => {
    changePage('home');
  });

  // Gérer le retour en arrière du navigateur
  window.addEventListener('popstate', () => {
    const page = location.hash.substring(1) || 'home';
    changePage(page);
  });

  // Charger la page initiale
  changePage(location.hash.substring(1) || 'home');

  // Fonction pour gérer les événements spécifiques à chaque page
  function setupPageEvents(page) {
    if (page === 'register') {
      const registrationForm = document.getElementById('registration-form');
      registrationForm.addEventListener('submit', event => {
        event.preventDefault();
        const alias = document.getElementById('alias').value;
        if (alias) {
          currentUser = { alias, profileImage: 'static/profiles/default.png' };
          alert(`Inscription réussie avec l'alias : ${alias}`);
          changePage('profile');
        }
      });
    }

    if (page === 'profile' && currentUser) {
      document.getElementById('profile-info').innerHTML = `
        <img src="${currentUser.profileImage}" class="profile-img" alt="Profile Image">
        <p>Pseudo : ${currentUser.alias}</p>
      `;

      const logoutButton = document.getElementById('logout-button');
      logoutButton.addEventListener('click', () => {
        currentUser = null;
        alert('Vous avez été déconnecté.');
        changePage('register');
      });
    }
  }
});
