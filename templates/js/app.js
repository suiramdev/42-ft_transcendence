import { Router } from './core/Router.js';
import { HomePage } from './pages/home.js';
import { TournamentPage } from './pages/tournament.js';
import { GamePage } from './pages/game.js';
import { ProfilePage } from './pages/profile.js';
import { RegisterPage } from './pages/register.js';

// Initialize the router in globalThis
// so it can be accessed from anywhere in the code
globalThis.router = null;

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  const router = new Router(rootElement);
  // Here we register the routes and the router will handle the navigation between pages
  router.registerRoute('/', new HomePage());
  router.registerRoute('/tournament', new TournamentPage());
  router.registerRoute('/game', new GamePage());
  router.registerRoute('/profile', new ProfilePage());
  router.registerRoute('/register', new RegisterPage());

  globalThis.router = router;
});
