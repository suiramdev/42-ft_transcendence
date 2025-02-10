import { Page } from '../core/Page.js';

export class HomePage extends Page {
  constructor() {
    super('home.html');
  }

  // Override mount to add custom behavior
  async mount(container) {
    await super.mount(container);
    // Add any page-specific initialization here
    return true;
  }
}
