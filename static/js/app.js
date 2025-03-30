import { Router } from './core/Router.js';
import { GamePage } from './pages/game.js';
import { ProfilePage } from './pages/profile/index.js';
import { UserProfilePage } from './pages/profile/id.js';
import { ChatPage } from './pages/chat.js';
import { getUser } from './services/user.js';
import { DirectMessagePage } from './pages/chat/:id.js';

// Initialize the router in globalThis
// so it can be accessed from anywhere in the code
globalThis.router = null;

document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.getElementById('page');
  const router = new Router(rootElement);

  // Register the routes
  router.registerRoute('/', new GamePage());
  router.registerRoute('/profile', new ProfilePage());
  router.registerRoute('/profile/:id', new UserProfilePage());
  router.registerRoute('/chat/:id', new DirectMessagePage());

  globalThis.router = router;

  getUser();
});
