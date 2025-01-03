document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('nav ul li a');
    const userInfoContainer = document.getElementById('user-info');

    // Liste des images de profil disponibles
    const profileImages = [
        'Utils/profiles/profile1.png',
        'Utils/profiles/profile2.png',
        'Utils/profiles/profile3.png',
        'Utils/profiles/profile4.png'
    ];

    let currentUser = null; // Utilisateur connecté

    const pages = {
        home: `
            <section id="home">
                <h2>Bienvenue au Pong Game</h2>
                <div class="gif-border">
                    <img src="Utils/Windows.jpg" alt="Pong Game GIF">
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
                <div id="tournament-info">
                    <p>Aucun tournoi en cours.</p>
                </div>
            </section>
        `,
        game: `
            <section id="game">
                <h2>Jeu Pong</h2>
                <canvas id="pongCanvas" width="800" height="600"></canvas>
            </section>
        `,
        profile: `
            <section id="profile">
                <h2>Your Profile</h2>
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
                                ${profileImages.map((img, idx) => `<option value="${img}">Image ${idx + 1}</option>`).join('')}
                            </select>
                            <button class="button-54" type="submit">Valider</button>
                        </form>
                    </div>
                    <button id="logout-button" class="button-54">Délog</button>
                </div>
            </section>
        `
    };

    // Gère la navigation entre les pages
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = link.dataset.page;
            mainContent.innerHTML = pages[page] || pages.home;
            history.pushState({}, '', `#${page}`);
            setupPageEvents();
        });
    });

    // Gère la navigation au changement d'URL
    window.addEventListener('popstate', () => {
        const page = location.hash.substring(1);
        mainContent.innerHTML = pages[page] || pages.home;
        setupPageEvents();
    });

    // Charge la page initiale, qui sera "home" par défaut
    const initialPage = location.hash.substring(1) || 'home';
    mainContent.innerHTML = pages[initialPage];
    setupPageEvents();

    // Configure les événements spécifiques à chaque page
    function setupPageEvents() {
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const alias = document.getElementById('alias').value;
                if (alias) {
                    const randomImage = profileImages[Math.floor(Math.random() * profileImages.length)];
                    currentUser = { alias, profileImage: randomImage };
                    alert(`Inscription réussie avec l'alias : ${alias}`);
                    updateUserInfo();
                    mainContent.innerHTML = pages.profile; // Passage directement à la page de profil
                    history.pushState({}, '', '#profile'); // Mémorise l'URL de profil dans l'historique
                    setupPageEvents();
                }
            });
        }

        const pongCanvas = document.getElementById('pongCanvas');
        if (pongCanvas) {
            const ctx = pongCanvas.getContext('2d');
            // Code pour dessiner le jeu Pong ici
        }

        const editNameButton = document.getElementById('edit-name-button');
        const editNameSection = document.getElementById('edit-name-section');
        const editNameForm = document.getElementById('edit-name-form');

        const editPhotoButton = document.getElementById('edit-photo-button');
        const editPhotoSection = document.getElementById('edit-photo-section');
        const editPhotoForm = document.getElementById('edit-photo-form');

        // Si l'utilisateur a un profil, on affiche les boutons de modification
        if (currentUser) {
            document.getElementById('edit-name-button').style.display = 'inline-block';
            document.getElementById('edit-photo-button').style.display = 'inline-block';
        }

        if (editNameButton) {
            editNameButton.addEventListener('click', () => {
                editNameSection.style.display = editNameSection.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (editNameForm) {
            editNameForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const newAlias = document.getElementById('new-alias').value;
                if (newAlias) {
                    currentUser.alias = newAlias;
                    alert('Pseudo mis à jour avec succès !');
                    updateUserInfo();
                    setupProfilePage();
                }
                editNameSection.style.display = 'none';
            });
        }

        if (editPhotoButton) {
            editPhotoButton.addEventListener('click', () => {
                editPhotoSection.style.display = editPhotoSection.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (editPhotoForm) {
            editPhotoForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const newProfileImg = document.getElementById('new-profile-img').value;
                if (newProfileImg) {
                    currentUser.profileImage = newProfileImg;
                    alert('Photo de profil mise à jour avec succès !');
                    updateUserInfo();
                    setupProfilePage();
                }
                editPhotoSection.style.display = 'none';
            });
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                currentUser = null;
                userInfoContainer.innerHTML = '';
                alert("Vous avez été déconnecté.");
                mainContent.innerHTML = pages.register;
                setupPageEvents();
            });
        }

        // Vérifie si l'utilisateur est connecté avant de permettre l'accès à la page profil
        if (location.hash.substring(1) === 'profile') {
            if (!currentUser) {
                mainContent.innerHTML = pages.register; // Redirige vers la page d'inscription si non inscrit
                history.pushState({}, '', '#register'); // Mémorise l'URL de la page d'inscription
                setupPageEvents();
            } else {
                setupProfilePage();
            }
        }
    }

    // Met à jour l'information utilisateur affichée
    function updateUserInfo() {
        if (currentUser) {
            userInfoContainer.innerHTML = `
                <img src="${currentUser.profileImage}" alt="Profil Image" class="profile-img">
                <span class="user-name">${currentUser.alias}</span>
            `;
        }
    }

    // Configure la page de profil
    function setupProfilePage() {
        if (currentUser) {
            const profileImgPreview = document.getElementById('profile-img-preview');
            const currentAlias = document.getElementById('current-alias');

            profileImgPreview.src = currentUser.profileImage;
            currentAlias.textContent = `Pseudo : ${currentUser.alias}`;
        }
    }
});
