import { getCookie } from '../utils/cookies.js';

document.addEventListener('DOMContentLoaded', () => {
  populateUserList();
});

async function populateUserList() {
  const accessToken = getCookie('access_token');
  if (!accessToken) {
    return;
  }

  const response = await fetch('/api/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Impossible de récupérer la liste des utilisateurs');

  const users = await response.json();
  const userListContainer = document.querySelector('.userlist__content');
  userListContainer.innerHTML = ''; // Vider la liste avant de la remplir

  users.forEach(user => {
    const userItem = document.createElement('a');
    userItem.classList.add('userlist__item');
    userItem.href = `/profile/${user.id}`;
    userItem.innerHTML = `
        <img src="/static/images/icons/user-online.png" class="userlist__item-icon" />
        <span class="userlist__name">${user.nickname}</span>
    `;

    userListContainer.appendChild(userItem);
  });
}
