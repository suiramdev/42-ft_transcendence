import { Page } from '../../core/Page.js';
import { isLoggedIn } from '../../services/user.js';
import { getCookie } from '../../utils/cookies.js';

export class DirectMessagePage extends Page {
  constructor() {
    super('chat/id.html', 'chat/id.css');
  }

  async onMount(params) {
    if (!isLoggedIn()) {
      router.navigate('/');
      return;
    }

    this.otherUserId = params.id;

    this.setupEventListeners();

    try {
      await this.loadUserInfo();
      await this.loadExistingMessages();
      await this.setupWebSocket();
    } catch (error) {
      console.error('Error loading user info or messages:', error);
    }
  }

  setupWebSocket() {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.close();
      }

      this.socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
          window.location.host
        }/ws/chat/${this.otherUserId}/?token=${getCookie('access_token')}`
      );

      this.socket.onmessage = this.onReceiveMessage.bind(this);

      this.socket.onopen = resolve;
      this.socket.onclose = reject;
      this.socket.onerror = reject;
    });
  }

  setupEventListeners() {
    document.querySelector('#chat-form').addEventListener('submit', this.onSubmitInput.bind(this));
    document
      .querySelector('#block-button')
      .addEventListener('click', this.handleBlockUser.bind(this));
    document
      .querySelector('#unblock-button')
      .addEventListener('click', this.handleUnblockUser.bind(this));
  }

  async loadUserInfo() {
    try {
      const response = await fetch(`/api/user/${this.otherUserId}/`, {
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (response.status === 404) {
        router.navigate('/404');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      document.querySelector('#chat-username').textContent = userData.nickname ?? 'Unknown User';
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }

  async loadExistingMessages() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUserId}`, {
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (response.status === 403) {
        this.updateChatBlockStatus(true);
        return;
      }

      if (response.status === 404) {
        router.navigate('/404');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const messages = await response.json();
      messages.forEach(message => {
        this.addMessageToChat({
          message: message.content,
          sender_id: message.sender.id,
          timestamp: message.timestamp,
        });
      });

      this.updateChatBlockStatus(false);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  /**
   * Update the chat block status, this will show or hide the block button and the blocked message
   *
   * @param {boolean} isBlocked - Whether the chat is blocked
   */
  updateChatBlockStatus(isBlocked) {
    const blockButton = document.querySelector('#block-button');
    const unblockButton = document.querySelector('#unblock-button');
    const chatError = document.querySelector('#chat-error');
    const chatForm = document.querySelector('#chat-form');

    if (isBlocked) {
      blockButton.style.display = 'none';
      unblockButton.style.display = 'flex';
      chatError.style.display = 'flex';
      chatForm.style.display = 'none';
    } else {
      blockButton.style.display = 'flex';
      unblockButton.style.display = 'none';
      chatError.style.display = 'none';
      chatForm.style.display = 'flex';
    }
  }

  async handleBlockUser() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUserId}/block_user/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to block user');

      this.updateChatBlockStatus(true);
      this.socket.close();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  async handleUnblockUser() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUserId}/unblock_user/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to unblock user');

      await this.setupWebSocket();
      await this.loadExistingMessages();
      this.updateChatBlockStatus(false);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }

  addMessageToChat(data) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat__message');

    if (data.sender_id === globalThis.user.id) {
      messageContainer.classList.add('chat__message--sent');
    } else {
      messageContainer.classList.add('chat__message--received');
    }

    const messageContent = document.createElement('div');
    messageContent.classList.add('chat__message-content');

    const messageText = document.createElement('div');
    messageText.classList.add('chat__message-text');
    messageText.textContent = data.message;

    const messageTime = document.createElement('div');
    messageTime.classList.add('chat__message-time');
    messageTime.textContent = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    messageContainer.appendChild(messageContent);
    document.querySelector('#chat-messages').appendChild(messageContainer);

    messageContainer.scrollIntoView({ behavior: 'smooth' });
  }

  onReceiveMessage(e) {
    const data = JSON.parse(e.data);
    this.addMessageToChat(data);
  }

  async onSubmitInput(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');

    if (!message.trim()) return;

    try {
      if (this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Connection is not open');
      }

      this.socket.send(
        JSON.stringify({
          message: message,
        })
      );
      e.target.reset();
    } catch (error) {
      console.error('Error sending message:', error);

      // Try to reconnect if connection is closed
      if (this.socket.readyState !== WebSocket.OPEN) {
        await this.setupWebSocket();
      }
    }
  }
}
