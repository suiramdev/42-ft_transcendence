import { Page } from '../../core/Page.js';
import { getCookie } from '../../utils/cookies.js';

export class DirectMessagePage extends Page {
  /**
   * The other user to chat with
   *
   * @type {Object}
   */
  otherUser;

  constructor() {
    super('chat/id.html', 'chat/id.css');
  }

  async beforeMount(params) {
    try {
      await this._loadUser(params.id);
    } catch (error) {
      globalThis.router.back();
      return false;
    }

    return true;
  }

  async onMount() {
    document.querySelector('#chat-form').addEventListener('submit', this._onSubmitInput.bind(this));
    document
      .querySelector('#block-button')
      .addEventListener('click', this._handleBlockUser.bind(this));
    document
      .querySelector('#unblock-button')
      .addEventListener('click', this._handleUnblockUser.bind(this));

    document.querySelector('#chat-username').textContent = this.otherUser.nickname;

    try {
      await this._loadExistingMessages();
      await this._connectToWebSocket();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  /**
   * Load the other user to chat with
   * @private
   *
   * @param {string} id - The id of the other user
   */
  async _loadUser(id) {
    const response = await fetch(`/api/user/${id}/`, {
      headers: {
        Authorization: `Bearer ${getCookie('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load user');
    }

    this.otherUser = await response.json();
  }

  /**
   * Connect to the web socket
   * @private
   *
   * @returns {Promise<void>}
   */
  async _connectToWebSocket() {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.close();
      }

      this.socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
          window.location.host
        }/ws/chat/${this.otherUser.id}/?token=${getCookie('access_token')}`
      );

      this.socket.onmessage = this._onReceiveMessage.bind(this);

      this.socket.onopen = resolve;
      this.socket.onclose = reject;
      this.socket.onerror = reject;
    });
  }

  /**
   * Load the existing messages
   * @private
   *
   * @returns {Promise<void>}
   * @throws {Error} If the response is not ok
   */
  async _loadExistingMessages() {
    const response = await fetch(`/api/chat/messages/${this.otherUser.id}`, {
      headers: {
        Authorization: `Bearer ${getCookie('access_token')}`,
      },
    });

    if (response.status === 403) {
      this._updateChatBlockStatus(true);
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to load messages');
    }

    const messages = await response.json();
    messages.forEach(message => {
      this._addMessageToChat({
        message: message.content,
        sender_id: message.sender.id,
        timestamp: message.timestamp,
      });
    });

    this._updateChatBlockStatus(false);
  }

  /**
   * Update the chat block status, this will show or hide the block button and the blocked message
   * @private
   *
   * @param {boolean} isBlocked - Whether the chat is blocked
   */
  _updateChatBlockStatus(isBlocked) {
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

  /**
   * Block the other user
   * @private
   *
   * @returns {Promise<void>}
   */
  async _handleBlockUser() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUser.id}/block_user/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to block user');

      this._updateChatBlockStatus(true);
      this.socket.close();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  /**
   * Unblock the other user
   * @private
   *
   * @returns {Promise<void>}
   */
  async _handleUnblockUser() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUser.id}/unblock_user/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to unblock user');

      await this._connectToWebSocket();
      await this._loadExistingMessages();
      this._updateChatBlockStatus(false);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }

  /**
   * Add a message to the chat
   * @private
   *
   * @param {Object} data - The message data
   */
  _addMessageToChat(data) {
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

  /**
   * Receive a message from the web socket
   * @private
   *
   * @param {Object} e - The event object
   */
  _onReceiveMessage(e) {
    const data = JSON.parse(e.data);
    this._addMessageToChat(data);
  }

  /**
   * Submit a message
   * @private
   *
   * @param {Event} e - The event object
   */
  async _onSubmitInput(e) {
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
