// Global variable to store the user data
// so that it can be accessed from anywhere
globalThis.user = null;

// function that gets the user data from the api
// and stores it in the global variable
export function getUser() {
  fetch('/api/user/me', { credentials: 'include' })
    .then(response => {
      if (!response.ok) throw new Error("Utilisateur non connecté");
      return response.json();
    })
    .then(data => {
      globalThis.user = data;
      document.dispatchEvent(new Event('userStateChange'));

      // Si l'utilisateur est connecté et est sur la page d'accueil, le rediriger
      if (window.location.pathname === '/' && isLoggedIn()) {
        window.location.href = '/profile'; //?jsp si c'est le bon
      }
    })
    .catch(() => {
      globalThis.user = null; // Réinitialise en cas d'erreur
      document.dispatchEvent(new Event('userStateChange'));
    });
}

// function that checks if the user is logged in
export function isLoggedIn() {
  return globalThis.user !== null;
}

// Function to sign out the user
export function signOut() {
  fetch('/api/auth/logout/', { method: 'POST' }) // jsp si c'est le bon url
    .then(() => {
      globalThis.user = null;
      document.dispatchEvent(new Event('userStateChange'));
      globalThis.router.navigate('/'); // Redirige vers la page d'accueil
    })
    .catch(error => console.error("Erreur de déconnexion :", error));
}
