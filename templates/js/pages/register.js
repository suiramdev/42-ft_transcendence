import { Page } from '../core/Page.js';

export class RegisterPage extends Page {
  constructor() {
    super('register.html');
  }

  // Override mount to add custom behavior
  async mount(container) {
    await super.mount(container);
    // Add any page-specific initialization here
    return true;
  }
}
