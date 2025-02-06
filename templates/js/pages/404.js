import { Page } from '../core/Page.js';

export class NotFoundPage extends Page {
  constructor() {
    super('404.html');
  }

  // Override mount to add custom behavior
  async mount(container) {
    await super.mount(container);
    // Add any page-specific initialization here
    return true;
  }
}
