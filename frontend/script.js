document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('nav ul li a');

    const pages = {
        home: `
            <section id="home">
                <h2>Bienvenue au Pong Game</h2>
                <p>Profitez d'une expérience unique !</p>
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
        account: `
            <section id="account">
                <h2>Gestion de Compte</h2>
                <form id="account-form">
                    <label for="profile-pic">Photo de Profil :</label>
                    <input type="file" id="profile-pic" name="profile-pic" accept="image/*">
                    <label for="new-alias">Nouvel Alias :</label>
                    <input type="text" id="new-alias" name="new-alias">
                    <label for="new-password">Nouveau Mot de Passe :</label>
                    <input type="password" id="new-password" name="new-password">
                    <button class="button-54" type="submit">Mettre à Jour</button>
                </form>
            </section>
        `
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = link.dataset.page;
            mainContent.innerHTML = pages[page] || pages.home;
            history.pushState({}, '', `#${page}`);
            setupPageEvents();
        });
    });

    window.addEventListener('popstate', () => {
        const page = location.hash.substring(1);
        mainContent.innerHTML = pages[page] || pages.home;
        setupPageEvents();
    });

    const initialPage = location.hash.substring(1) || 'home';
    mainContent.innerHTML = pages[initialPage];
    setupPageEvents();

    function setupPageEvents() {
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const alias = document.getElementById('alias').value;
                if (alias) {
                    alert(`Inscription réussie avec l'alias : ${alias}`);
                }
            });
        }

        const accountForm = document.getElementById('account-form');
        if (accountForm) {
            accountForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const profilePic = document.getElementById('profile-pic').files[0];
                const newAlias = document.getElementById('new-alias').value;
                const newPassword = document.getElementById('new-password').value;
                if (profilePic || newAlias || newPassword) {
                    alert(`Compte mis à jour avec succès !`);
                    // Ajoutez ici la logique pour mettre à jour le compte dans le backend
                }
            });
        }

        const pongCanvas = document.getElementById('pongCanvas');
        if (pongCanvas) {
            const ctx = pongCanvas.getContext('2d');
            // Code pour dessiner le jeu Pong ici
        }
    }
});
