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
  fetch("/api/auth/42/authorize", {
    method: "GET",
    credentials: "include",
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to redirect to 42 authentication");
    }
    return response.url;
  })
  .then((authUrl) => {
    window.location.href = authUrl; // Redirige vers l'URL d'authentification 42
  })
  .catch((error) => {
    console.error("Authentication error:", error);
  });
}

function handleSignOutClick() {
  signOut();
}
