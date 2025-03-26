import { getCookie } from '../utils/cookies.js';

// Global variable to store the user data
// so that it can be accessed from anywhere
globalThis.user = null;

export async function getUser() {
  const accessToken = getCookie('access_token');

  if (!accessToken) {
    globalThis.user = null;
    document.dispatchEvent(new Event('userStateChange'));
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
      globalThis.user = data;
      document.dispatchEvent(new Event('userStateChange'));

      if (window.location.pathname === '/' && isLoggedIn()) {
        router.navigate('/profile');
      }
    })
    .catch(() => {
      globalThis.user = null;
      document.dispatchEvent(new Event('userStateChange'));
    });
}

// function that checks if the user is logged in
export function isLoggedIn() {
  return globalThis.user !== null;
}

// Function to sign out the user
export function signOut() {
  // Supprimer les cookies en les expirant
  document.cookie =
    'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax';
  document.cookie =
    'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax';

  // Reset user state
  globalThis.user = null;
  document.dispatchEvent(new Event('userStateChange'));

  // Redirection vers la page d'accueil
  globalThis.router.navigate('/');
}

/** ============================
 *  AJOUT : Mise à jour du profil
 *  ============================ */
export async function updateUser(updatedUser) {
  const accessToken = await fetchToken();
  if (!accessToken) {
    console.error("Impossible de mettre à jour l'utilisateur : Pas de token");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("nickname", updatedUser.nickname);
    formData.append("bio", updatedUser.bio);
    if (updatedUser.avatar instanceof File) {
      formData.append("avatar", updatedUser.avatar);
    }

    const response = await fetch('/api/user/me/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
