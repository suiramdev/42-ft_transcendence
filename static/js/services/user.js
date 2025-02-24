globalThis.currentUser = JSON.parse(localStorage.getItem('currentUser')) ?? null;

/**
 * Returns true if the user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(currentUser);
}

/**
 * Updates the current user
 * @param {Object} user - The user data
 */
export function updateCurrentUser(user) {
  currentUser = user;
  console.log('Updating current user:', user);
  localStorage.setItem('currentUser', JSON.stringify(user));
  // Dispatch a custom event when user state changes
  document.dispatchEvent(new CustomEvent('userStateChange', { detail: user }));
}

/**
 * Registers a new user with an alias and a profile picture
 * @param {string} alias - The alias of the user
 * @param {string} [profilePicture] - The profile picture of the user
 */
export function signUp(alias, profilePicture = '/static/images/avatars/duck.webp') {
  updateCurrentUser({ alias, profilePicture });
}

/**
 * Signs out the current user
 */
export function signOut() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  // Dispatch event when user signs out
  document.dispatchEvent(new CustomEvent('userStateChange', { detail: null }));
}
