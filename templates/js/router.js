import { ROUTES } from './config/constants.js';
import { HomePage } from './pages/home.js';
import { GamePage } from './pages/game.js';

export class Router {
  constructor(mainContentId) {
    this.mainContent = document.getElementById(mainContentId);
    this.pages = {
      [ROUTES.home]: new HomePage(),
      [ROUTES.game]: new GamePage(),
    };
    this.init();
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    this.handleRoute();
  }

  async handleRoute() {
    const page = location.hash.substring(1) || ROUTES.home;
    const pageInstance = this.pages[page];

    if (pageInstance) {
      const mounted = await pageInstance.mount(this.mainContent);
      if (!mounted) {
        this.navigate(ROUTES.register);
      }
    }
  }

  navigate(route) {
    history.pushState({}, '', `#${route}`);
    this.handleRoute();
  }
}
