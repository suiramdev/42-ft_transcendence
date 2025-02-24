import { isLoggedIn, signOut, signUp } from '../services/user.js';

document.addEventListener('DOMContentLoaded', () => {
  const signInButton = document.querySelector('.navbar #sign-in');
  const signOutButton = document.querySelector('.navbar #sign-out');

  signInButton.addEventListener('click', handleSignInClick);
  signOutButton.addEventListener('click', handleSignOutClick);

  refreshNavbar();
});

document.addEventListener('userStateChange', () => {
  refreshNavbar();
});

function refreshNavbar() {
  const signInButton = document.querySelector('.navbar #sign-in');
  const signOutButton = document.querySelector('.navbar #sign-out');
  const profileLink = document.querySelector('.navbar #profile-link');

  if (isLoggedIn()) {
    signInButton.style.display = 'none';
    signOutButton.style.display = 'flex';
    profileLink.style.display = 'flex';
  } else {
    signInButton.style.display = 'flex';
    signOutButton.style.display = 'none';
    profileLink.style.display = 'none';
  }
}

function handleSignInClick() {
  // TODO: Implement sign in
  const alias = prompt('Enter your alias:');
  if (alias) {
    signUp(alias);
  }
}

function handleSignOutClick() {
  signOut();
}
