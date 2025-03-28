import { getCookie, deleteCookie } from '../utils/cookies.js';

// Global variable to store the user data
// so that it can be accessed from anywhere
globalThis.user = null;

/**
 * Fetch the user data from the server and store it in the global user variable
 *
 * @returns {Promise<void>}
 */
export async function fetchUser() {
  const accessToken = getCookie('access_token');

  if (!accessToken) {
    globalThis.user = null;
    document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
    return;
  }

  fetch('/api/user/me/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) throw new Error('Utilisateur non connecté');
      return response.json();
    })
    .then(data => {
      if (!globalThis.user) {
        // If the user was not logged in, dispatch a signIn event
        document.dispatchEvent(new CustomEvent('signIn'));
      }

      globalThis.user = data;
      document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
    })
    .catch(() => {
      globalThis.user = null;
      document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
    });
}

/**
 * Check if the user is logged in
 *
 * @returns {boolean}
 */
export function isLoggedIn() {
  return globalThis.user !== null;
}

/**
 * Sign out the user
 *
 * @returns {Promise<void>}
 */
export function signOut() {
  deleteCookie('access_token');
  deleteCookie('refresh_token');

  globalThis.user = null;
  document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
  document.dispatchEvent(new CustomEvent('signOut'));

  globalThis.router.navigate('/');
}
