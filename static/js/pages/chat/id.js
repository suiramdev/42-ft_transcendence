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

    this.socket = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat/${
        params.id
      }/?token=${getCookie('access_token')}`
    );
    this.socket.onmessage = this.onReceiveMessage.bind(this);

    document.querySelector('#chat-form').addEventListener('submit', this.onSubmitInput.bind(this));

    // Load existing messages when mounting the page
    await this.loadExistingMessages(params.id);
  }

  async loadExistingMessages(chatId) {
    try {
      const response = await fetch(`/api/chat/messages/${chatId}/conversation/`, {
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const messages = await response.json();
      messages.forEach(message => {
        this.addMessageToChat({
          message: message.content,
          sender_id: message.sender.id,
          timestamp: message.timestamp,
        });
      });
    } catch (error) {
      console.error('Error loading messages:', error);
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

    // Send the message to the target user
    this.socket.send(
      JSON.stringify({
        message: message,
      })
    );
    e.target.reset();
  }
}
