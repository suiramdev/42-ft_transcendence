import { Page } from '../core/Page.js';

export class UserProfilePage extends Page {
  constructor() {
    super('user-profile.html', 'user-profile.css');
  }

  onMount(params) {
    console.log('Loading user profile with ID:', params.id);
    document.querySelector('#user-id').textContent = params.id;
  }
}
