/**
 * Base class for all pages
 * @class
 * @classdesc Manages the template and rendering of pages
 */
export class Page {
  /**
   * Constructor for the Page class
   * @param {string} templatePath - The path to the template file
   */
  constructor(templatePath) {
    this.templatePath = templatePath;
    this.template = null;
  }

  /**
   * Fetches the template HTML from the server
   * @returns {Promise<string>} The template HTML content
   * @private
   */
  async fetchTemplate() {
    try {
      const response = await fetch(`/static/templates/${this.templatePath}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      const html = await response.text();
      this.template = html;
      return html;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Renders the template into the specified container
   * @param {HTMLElement} container - The container element to render the template into
   * @private
   */
  render(container) {
    if (!container) {
      throw new Error('Container element is required for rendering');
    }
    container.innerHTML = this.template;
  }

  /**
   * Mounts the page by fetching the template and performing any necessary setup
   * @param {HTMLElement} container - The container element to mount the page into
   * @returns {Promise<boolean>} Whether the mount was successful
   */
  async mount(container) {
    try {
      if (!this.template) {
        await this.fetchTemplate();
      }
      this.render(container);
      return true;
    } catch (error) {
      console.error('Error mounting page:', error);
      return false;
    }
  }
}
