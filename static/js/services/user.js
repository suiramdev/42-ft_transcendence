// Global variable to store the user data
// so that it can be accessed from anywhere
globalThis.user = null;

// function that gets the user data from the api
// and stores it in the global variable
export function getUser() {
  fetch('/api/user/')
    .then(response => response.json())
    .then(data => {
      user = data;
      document.dispatchEvent(new Event('userStateChange'));
    })
    .catch(error => console.error("Erreur de récupération de l'utilisateur :", error));
}
