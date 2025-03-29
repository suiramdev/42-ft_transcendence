import { Page } from '../core/Page.js';
import { isLoggedIn } from '../services/user.js';
import { initializeDirectMessageSocket, sendDirectMessage } from '../services/chat.js';

export class DirectMessagePage extends Page {
  targetId = null;

  constructor() {
    super('chat/:id.html', 'chat/:id.css');
  }

  async onMount(params) {
    if (!isLoggedIn()) {
      router.navigate('/');
    }

    // Set the target user id from the url params
    this.targetId = params.id;

    // Listen for messages from the target user
    const listeningSocket = await initializeDirectMessageSocket(globalThis.user.id);
    listeningSocket.onmessage = this.onReceiveMessage;

    document.querySelector('#chat-form').addEventListener('submit', this.onSubmitInput);
  }

  onReceiveMessage(e) {
    const data = JSON.parse(e.data);
    if (data.senderId === this.targetId) {
      if (data.type === 'message') {
        const element = document.createElement('span');
        element.textContent = data.content;
        document.querySelector('#chat-messages').appendChild(element);
      }

      // TODO: Handle other message types
    }
  }

  async onSubmitInput(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');

    // Send the message to the target user
    await sendDirectMessage(this.targetId, message);
    e.target.reset();
  }
}
