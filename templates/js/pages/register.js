import { Page } from '../core/Page.js';
import { login } from '../services/user.js';

export class RegisterPage extends Page {
  constructor() {
    super('register.html');
  }

  /**
   * Handle the registration form submit event
   * @private
   */
  handleRegistrationFormSubmit() {
    const registrationForm = document.getElementById('registration-form');

    registrationForm.addEventListener('submit', event => {
      event.preventDefault();
      const alias = event.target.alias.value;
      login(alias);
    });
  }

  async mount(container) {
    await super.mount(container);

    this.handleRegistrationFormSubmit();

    return true;
  }
}
