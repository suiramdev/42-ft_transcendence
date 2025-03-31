import { Page } from '../core/Page.js';
import { getCookie } from '../utils/cookies.js';

export class UserProfilePage extends Page {
  constructor() {
    super('user-profile.html', 'user-profile.css');
  }

  async onMount(params) {
    console.log('Loading user profile with ID:', params.id);
    await loadUserProfile(params.id); // Charge le profil correspondant à l'ID
  }
}

///////////////////////////
async function loadUserProfile(userId) {
  const accessToken = getCookie("access_token");
  if (!accessToken) {
    console.warn("Aucun token trouvé, redirection vers /sign-in");
    router.navigate("/sign-in");
    return;
  }

  try {
    // Récupérer l'utilisateur connecté
    const responseMe = await fetch("/api/user/me/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!responseMe.ok) throw new Error("Utilisateur non connecté");

    const currentUser = await responseMe.json();

    // Si l'ID demandé est celui du user connecté, charge `/api/user/me/`
    const url = userId == currentUser.id ? "/api/user/me/" : `/api/user/${userId}/`;

    // Récupérer les infos du profil
    const responseProfile = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!responseProfile.ok) throw new Error("Profil introuvable");

    const userProfile = await responseProfile.json();

    // ✅ Mise à jour de l'affichage
    document.querySelector(".profile__alias").textContent = userProfile.nickname || "Utilisateur inconnu";
    document.querySelector(".profile__bio").textContent = userProfile.bio || "Aucune bio renseignée.";
    document.querySelector(".profile__avatar-image").src = userProfile.avatar || "/static/images/icons/user-default.png";
    document.querySelector("#user-id").textContent = userProfile.id;

  } catch (error) {
    console.error("Erreur :", error);
    router.navigate("/not-found");
  }
}

///////////////////////////


//function to list users
async function populateUserList() {
  const accessToken = getCookie('access_token');

  if (!accessToken) {
    console.warn("Aucun token trouvé, les utilisateurs ne seront pas chargés.");
    return;
  }

  try {
    const response = await fetch("/api/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Impossible de récupérer la liste des utilisateurs");

    const users = await response.json();
    const userListContainer = document.querySelector(".userlist__content");
    userListContainer.innerHTML = ""; // Vider la liste avant de la remplir

    users.forEach((user) => {
      const userItem = document.createElement("a");

      if (user.status === "offline") {
        userItem.classList.add("userlist__item", "userlist__item--offline");
        userItem.href = "#"; // Désactiver le lien si offline
        userItem.style.pointerEvents = "none"; // Désactive le clic
      } else {
        userItem.classList.add("userlist__item");
        userItem.href = `/profile/${user.id}`;
      }

      userItem.innerHTML = `
        <span class="userlist__name">${user.nickname}</span>
        <img src="/static/images/icons/user-${user.status}.png" class="userlist__status-icon" alt="${user.status}" />
      `;

      if (user.status !== "offline") {
        userItem.addEventListener("click", (event) => {
          event.preventDefault();
          router.navigate(`/profile/${user.id}`);
        });
      }

      userListContainer.appendChild(userItem);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs :", error);
  }
}

// Exécuter la mise à jour au chargement
document.addEventListener("DOMContentLoaded", populateUserList);
