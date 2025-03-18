// Global variable to store the user data
// so that it can be accessed from anywhere
globalThis.user = null;

async function fetchToken() {
  const response = await fetch('/api/auth/get-token/', {
    method: 'GET',
    credentials: 'include',  // Permet d'envoyer les cookies
  });
  if (!response.ok) {
    console.error('Impossible de récupérer le token');
    return null;
  }
  const data = await response.json();
  return data.access_token;
}

export async function getUser() {
  const accessToken = await fetchToken();
  console.log('Access Token:', accessToken);
  if (!accessToken) {
    globalThis.user = null;
    document.dispatchEvent(new Event('userStateChange'));
    return;
  }
  fetch('/api/user/me/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.ok) throw new Error("Utilisateur non connecté");
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
  //debug
  console.log('isLoggedIn Check:', globalThis.user);
  return globalThis.user !== null;
}

// Function to sign out the user
export function signOut() {
  // Supprimer les cookies en les expirant
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax";
  document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Lax";

  // Reset user state
  globalThis.user = null;
  document.dispatchEvent(new Event('userStateChange'));

  // Redirection vers la page d'accueil
  globalThis.router.navigate('/');
}
