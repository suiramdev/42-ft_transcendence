import { Page } from '../core/Page.js';
import { PROFILE_IMAGES } from '../config/constants.js';

export class TournamentPage extends Page {
  constructor() {
    super('tournament.html');
  }

  // Override mount to add custom behavior
  async mount(container) {
    await super.mount(container);
    // Add any page-specific initialization here
    return true;
  }
}
