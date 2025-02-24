import { NotFoundPage } from '../pages/not-found.js';

/**
 * Router class
 * @class
 * @classdesc Manages navigation between pages
 */
export class Router {
  pages = {};

  /**
   * Constructor for the Router class
   * @param {HTMLElement} rootElement - The root element
   */
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.init();
  }

  /**
   * Initializes the router by adding a popstate event listener and handling the initial route
   * @private
   */
  init() {
    window.addEventListener('DOMContentLoaded', () => {
      this.populateNavigationLinks();
      // Handle the initial route
      this.handleRoute();
    });
    window.addEventListener('popstate', () => {
      // Handle route changes when the user navigates back/forward
      this.handleRoute();
    });
  }

  /**
   * Adds click event listeners to all navigation links to handle routing
   * internally rather than triggering full page reloads
   * @private
   */
  populateNavigationLinks() {
    const navigationLinks = document.querySelectorAll('a[href]');
    navigationLinks.forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        this.navigate(link.getAttribute('href'));
      });
    });
  }

  /**
   * Handles the route change by updating the main content and mounting the appropriate page
   * @private
   */
  async handleRoute() {
    const page = this.pages[location.pathname];
    console.log('Handling route:', location.pathname);

    if (page) {
      await page.mount(this.rootElement);
    } else {
      const notFoundPage = new NotFoundPage();
      await notFoundPage.mount(this.rootElement);
    }
  }

  /**
   * Navigates to the specified route
   * @param {string} route - The route to navigate to
   */
  navigate(route) {
    const previousRoute = location.pathname;
    console.log(`(${this.constructor.name}) Navigating from ${previousRoute} to ${route}`);
    history.pushState({}, '', route);
    this.handleRoute();
  }

  /**
   * Registers a new route with its corresponding page instance
   * @param {string} route - The route path to register
   * @param {object} pageInstance - The page instance to associate with the route
   * @throws {Error} If the route is already registered
   */
  registerRoute(route, pageInstance) {
    if (this.pages[route]) {
      throw new Error(`Route "${route}" is already registered`);
    }
    this.pages[route] = pageInstance;
  }
}
