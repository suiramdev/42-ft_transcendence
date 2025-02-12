globalThis.currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function updateUser(user) {
  currentUser = user;
}

export function register(alias, profilePicture = 'static/profiles/profile1.png') {
  currentUser = { alias, profilePicture };
  saveUserData = { alias, profilePicture};
  router.navigate('/profile'); // Redirige vers la page de profil après l'enregistrement
}

// Fonction pour enregistrer l'utilisateur (pseudo et photo de profil)
export function saveUserData(alias, profilePicture) {
  localStorage.setItem('userAlias', alias);
  localStorage.setItem('userProfilePicture', profilePicture);
}

// Fonction pour récupérer les données utilisateur
export function getUserData() {
  const alias = localStorage.getItem('userAlias') || 'PseudoUtilisateur'; // Valeur par défaut si non trouvé
  const profilePicture = localStorage.getItem('userProfilePicture') || 'templates/img/profiles/profile1.png'; // Valeur par défaut (marchpa)
  return { alias, profilePicture };
}

// Fonction pour déconnecter l'utilisateur (vider les données)
export function logout() {
  localStorage.removeItem('userAlias');
  localStorage.removeItem('userProfilePicture');
}
