globalThis.currentUser = null;

export function login(alias) {
  currentUser = { alias, profilePicture: 'static/profiles/profile1.png' };
  router.navigate('/profile');
}

export function logout() {
  currentUser = null;
  router.navigate('/');
}

export function getCurrentUser() {
  return currentUser;
}

export function updateUser(user) {
  currentUser = user;
}
