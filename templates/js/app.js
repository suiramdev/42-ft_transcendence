import { Router } from './core/Router.js';
import { HomePage } from './pages/home.js';
import { GamePage } from './pages/game.js';

// Initialize the router in globalThis
// so it can be accessed from anywhere in the code
globalThis.router = null;

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  const router = new Router(rootElement);
  // Here we register the routes and the router will handle the navigation between pages
  router.registerRoute('/', new HomePage());
  router.registerRoute('/game', new GamePage());

  globalThis.router = router;
});
