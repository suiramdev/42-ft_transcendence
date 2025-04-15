import { getCookie } from '../utils/cookies.js';

document.addEventListener('DOMContentLoaded', () => {
  populateFriendsList();
  setupAddFriendForm();
});

document.addEventListener('userStateChange', () => {
  populateFriendsList();
});

function setupAddFriendForm() {
  // Add the HTML form for adding friends
  const userlistHeader = document.querySelector('.userlist__header');
  
  const userlistTitle = userlistHeader.querySelector('.userlist__title');
  if (userlistTitle) {
    userlistTitle.textContent = 'Friends';
  }

  if (userlistHeader) {
    // Create add friend button that will toggle the form visibility
    const addFriendButton = document.createElement('button');
    addFriendButton.classList.add('userlist__add-friend-btn');
    addFriendButton.textContent = '+'; // Simple + instead of Font Awesome icon
    addFriendButton.title = "Add Friend";
    userlistHeader.appendChild(addFriendButton);
    
    // Create the form container
    const formContainer = document.createElement('div');
    formContainer.classList.add('userlist__add-friend-form');
    formContainer.style.display = 'none';
    formContainer.innerHTML = `
      <input type="text" class="userlist__add-friend-input" placeholder="Username" />
      <button type="button" class="userlist__add-friend-submit">Add</button>
      <div class="userlist__add-friend-message"></div>
    `;
    
    // Insert the form after the header
    userlistHeader.parentNode.insertBefore(formContainer, userlistHeader.nextSibling);
    
    // Toggle form visibility when clicking the add friend button
    addFriendButton.addEventListener('click', () => {
      formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
      if (formContainer.style.display === 'block') {
        formContainer.querySelector('.userlist__add-friend-input').focus();
      }
    });
    
    // Handle form submission
    const submitButton = formContainer.querySelector('.userlist__add-friend-submit');
    submitButton.addEventListener('click', handleAddFriend);
    
    // Allow pressing Enter to submit
    const input = formContainer.querySelector('.userlist__add-friend-input');
    input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        handleAddFriend();
      }
    });
  }
}

async function handleAddFriend() {
  const input = document.querySelector('.userlist__add-friend-input');
  const messageDisplay = document.querySelector('.userlist__add-friend-message');
  const username = input.value.trim();
  
  if (!username) {
    showAddFriendMessage('Please enter a username', 'error');
    return;
  }
  
  try {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      showAddFriendMessage('You must be logged in', 'error');
      return;
    }
    
    const response = await fetch('/api/user/friend/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAddFriendMessage(data.message, 'success');
      input.value = '';
      // Refresh the friends list
      populateFriendsList();
    } else {
      showAddFriendMessage(data.error, 'error');
    }
  } catch (error) {
    showAddFriendMessage('An error occurred. Please try again.', 'error');
    console.error('Error adding friend:', error);
  }
}

function showAddFriendMessage(message, type) {
  const messageDisplay = document.querySelector('.userlist__add-friend-message');
  messageDisplay.textContent = message;
  messageDisplay.className = 'userlist__add-friend-message';
  messageDisplay.classList.add(`userlist__add-friend-message--${type}`);
  messageDisplay.style.display = 'block';
  
  // Hide the message after 3 seconds
  setTimeout(() => {
    messageDisplay.style.display = 'none';
  }, 3000);
}

async function populateFriendsList() {
  const accessToken = getCookie('access_token');
  if (!accessToken) {
    return;
  }

  const response = await fetch('/api/user/friends/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to retrieve friends list');

  const friends = await response.json();
  const userListContainer = document.querySelector('.userlist__content');
  userListContainer.innerHTML = ''; // Clear the list before filling it

  // If the user has no friends, display a message
  if (friends.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.classList.add('userlist__empty');
    emptyMessage.textContent = 'No friends yet';
    userListContainer.appendChild(emptyMessage);
    return;
  }

  // Create a list item for each friend
  friends.forEach(friend => {
    const userItem = document.createElement('a');
    userItem.classList.add('userlist__item');
    userItem.href = `/profile/${friend.id}`;
    
    // Set status icon based on friend's status
    let statusIcon = 'user-offline.png';
    if (friend.status === 'online') {
      statusIcon = 'user-online.png';
    } else if (friend.status === 'in_game') {
      statusIcon = 'user-ingame.png';
    }
    
    userItem.innerHTML = `
        <img src="/static/images/icons/${statusIcon}" class="userlist__item-icon" />
        <span class="userlist__name">${friend.nickname || friend.username}</span>
    `;

    userListContainer.appendChild(userItem);
  });
}