// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logout-button');

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      currentUser = null;
      userInfoContainer.innerHTML = '';
      alert('Vous avez été déconnecté.');
      mainContent.innerHTML = pages.register;
      setupPageEvents();
    });
  }
});
