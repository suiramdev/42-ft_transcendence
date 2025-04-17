/**
 * i18n.js - Internationalization utilities for the application
 * Vanilla JavaScript implementation of multi-language support
 */

// Default language
const DEFAULT_LANGUAGE = 'en';

// Available languages
const AVAILABLE_LANGUAGES = ['en', 'fr', 'es'];

// Store translations for each language
const translations = {
  en: {
    // Navigation
    'nav.game': 'Game',
    'nav.multiplayer': 'Multiplayer',
    'nav.profile': 'My Profile',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',

    // User list
    'users.title': 'Users',

    // Common UI elements
    'ui.window.title': 'ft_transcendence',

    // Game related
    'game.title': 'Pong Game',
    'game.start': 'Start Game',
    'game.pause': 'Pause',
    'game.resume': 'Resume',
    'game.restart': 'Restart',

    // Profile related
    'profile.title': 'Profile',
    'profile.stats': 'Statistics',
    'profile.history': 'Match History',

    // Language names (for the selector)
    'language.en': 'English',
    'language.fr': 'Français',
    'language.es': 'Español',
  },
  fr: {
    // Navigation
    'nav.game': 'Jeu',
    'nav.multiplayer': 'Multijoueur',
    'nav.profile': 'Mon Profil',
    'nav.signIn': 'Se Connecter',
    'nav.signOut': 'Se Déconnecter',

    // User list
    'users.title': 'Utilisateurs',

    // Common UI elements
    'ui.window.title': 'ft_transcendence',

    // Game related
    'game.title': 'Jeu de Pong',
    'game.start': 'Démarrer',
    'game.pause': 'Pause',
    'game.resume': 'Reprendre',
    'game.restart': 'Recommencer',

    // Profile related
    'profile.title': 'Profil',
    'profile.stats': 'Statistiques',
    'profile.history': 'Historique des matchs',

    // Language names (for the selector)
    'language.en': 'English',
    'language.fr': 'Français',
    'language.es': 'Español',
  },
  es: {
    // Navigation
    'nav.game': 'Juego',
    'nav.multiplayer': 'Multijugador',
    'nav.profile': 'Mi Perfil',
    'nav.signIn': 'Iniciar Sesión',
    'nav.signOut': 'Cerrar Sesión',

    // User list
    'users.title': 'Usuarios',

    // Common UI elements
    'ui.window.title': 'ft_transcendence',

    // Game related
    'game.title': 'Juego de Pong',
    'game.start': 'Comenzar Juego',
    'game.pause': 'Pausar',
    'game.resume': 'Continuar',
    'game.restart': 'Reiniciar',

    // Profile related
    'profile.title': 'Perfil',
    'profile.stats': 'Estadísticas',
    'profile.history': 'Historial de Partidas',

    // Language names (for the selector)
    'language.en': 'English',
    'language.fr': 'Français',
    'language.es': 'Español',
  },
};

// Get current language from localStorage or use default
const getCurrentLanguage = () => {
  return localStorage.getItem('language') || DEFAULT_LANGUAGE;
};

// Set current language and save to localStorage
const setLanguage = lang => {
  if (AVAILABLE_LANGUAGES.includes(lang)) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    translatePage();
    // Dispatch a custom event for components that need to react to language changes
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    return true;
  }
  return false;
};

// Get translation for a key
const t = key => {
  const lang = getCurrentLanguage();
  return translations[lang]?.[key] || translations[DEFAULT_LANGUAGE][key] || key;
};

// Translate the page content
const translatePage = () => {
  // Translate elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  // Translate elements with data-i18n-placeholder attribute (for input placeholders)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });

  // Translate elements with data-i18n-title attribute (for tooltips)
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.title = t(key);
  });
};

// Initialize language settings
const initI18n = () => {
  const currentLang = getCurrentLanguage();
  document.documentElement.lang = currentLang;
  translatePage();
};

export { AVAILABLE_LANGUAGES, getCurrentLanguage, setLanguage, t, translatePage, initI18n };
