import { getCookie } from '../utils/cookies.js';

/**
 * Global variable to store the user data
 * so that it can be accessed from anywhere
 *
 * @type {Object | null}
 */
globalThis.user = null;

/**
 * Get the user data from the server
 *
 * @returns {Promise<Object>}
 */
export async function getUser() {
  const accessToken = getCookie('access_token');
  if (!accessToken) {
    globalThis.user = null;
    document.dispatchEvent(new Event('userStateChange'));
    return;
  }

  const response = await fetch('/api/user/me/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // If the user is not connected, set the user to null and dispatch an event
  if (!response.ok) {
    globalThis.user = null;
    document.dispatchEvent(new Event('userStateChange'));
    return null;
  }

  const data = await response.json();
  globalThis.user = data;
  document.dispatchEvent(new Event('userStateChange'));

  return data;
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
 */
export function signOut() {
  // Delete the cookies by expiring them
  document.cookie =
    'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax';
  document.cookie =
    'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax';

  // Reset user state
  globalThis.user = null;
  document.dispatchEvent(new Event('userStateChange'));

  // Redirect to the home page
  globalThis.router.navigate('/');
}

/**
 * Update the user
 *
 * @param {Object} data
 * @param {string} data.nickname
 * @param {string} data.bio
 * @param {File} data.avatar
 */
export async function updateUser(data) {
  const accessToken = getCookie('access_token');
  if (!accessToken) {
    console.error("Impossible de mettre à jour l'utilisateur : Pas de token");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nickname', data.nickname);
    formData.append('bio', data.bio);
    if (data.avatar instanceof File) {
      formData.append('avatar', data.avatar);
    }

    const response = await fetch('/api/user/me/', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil');

    globalThis.user = await response.json();
    document.dispatchEvent(new Event('userStateChange'));
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
  }
}
