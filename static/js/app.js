import { Router } from './core/Router.js';
import { GamePage } from './pages/game.js';
import { ProfilePage } from './pages/profile.js';
import { UserProfilePage } from './pages/user-profile.js';
import { ChatPage } from './pages/chat.js';
import { fetchUser } from './services/user.js';
import { DirectMessagePage } from './pages/chat/:id.js';

// Initialize the router in globalThis
// so it can be accessed from anywhere in the code
globalThis.router = null;

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('page');
  const router = new Router(rootElement);

  // Register the routes
  router.registerRoute('/', new GamePage());
  router.registerRoute('/profile', new ProfilePage());
  router.registerRoute('/chat', new ChatPage());
  router.registerRoute('/profile/:id', new UserProfilePage());
  router.registerRoute('/chat/:id', new DirectMessagePage());

  globalThis.router = router;

  // Fetch user info at startup
  fetchUser();
});
