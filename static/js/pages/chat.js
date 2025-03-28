import { Page } from '../core/Page.js';
import { isLoggedIn } from '../services/user.js';
import { initializeDirectMessageSocket, sendDirectMessage } from '../services/chat.js';

export class ChatPage extends Page {
  selectedUser = null;

  constructor() {
    super('chat.html', 'chat.css');
  }

  async onMount() {
    if (!isLoggedIn()) {
      router.navigate('/');
    }

    const targetId = globalThis.user.id;
    const socket = await initializeDirectMessageSocket(targetId);
    socket.onmessage = this.onMessage;

    document.querySelector('#chat-form').addEventListener('submit', this.onSubmitInput);
  }

  onMessage(e) {
    const data = JSON.parse(e.data);
    console.log(data);
  }

  async onSubmitInput(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');

    const targetId = globalThis.user.id;
    await sendDirectMessage(targetId, message);
    e.target.reset();
  }
}
