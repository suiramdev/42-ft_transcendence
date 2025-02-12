import { Page } from '../core/Page.js';
import { register } from '../services/user.js';
import { windowManager } from '../components/windowManager.js';

export class RegisterPage extends Page {
  constructor() {
    super('register.html');
  }

  async mount() {
    if (!document.getElementById('root')) {
      console.error("⚠️ Root element not found!");
      return false;
    }

    try {
      const response = await fetch(`/static/templates/register.html`);
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement de register.html : ${response.statusText}`);
      }

      const htmlText = await response.text();
      console.log(" Contenu HTML chargé :", htmlText);

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const formContent = doc.querySelector('#register');

      if (!formContent) {
        throw new Error("Élément #register non trouvé dans register.html");
      }

      console.log(" Contenu extrait :", formContent.outerHTML);
      windowManager.openWindow('Inscription', formContent.outerHTML);

      setTimeout(() => {
        this.attachFormEvent();
      }, 100);
    } catch (error) {
      console.error(" Erreur :", error);
    }

    return true;
  }

  attachFormEvent() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const alias = event.target['alias'].value;
        if (alias.trim()) {
          register(alias);  // Appeler la fonction register pour créer l'utilisateur
        }
      });
    }
  }
}
