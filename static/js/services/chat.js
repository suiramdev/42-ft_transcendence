import { getCookie } from '../utils/cookies.js';

/**
 * Map of user id to WebSocket
 *
 * This is used to avoid creating a new WebSocket for each message
 * and to ensure that the WebSocket is properly closed when the user
 * logs out.
 *
 * @type {Map<string, WebSocket>}
 */
globalThis.chatSockets = new Map();

export async function initializeDirectMessageSocket(userId) {
  return new Promise((resolve, reject) => {
    const existingSocket = globalThis.chatSockets.get(userId);

    if (!existingSocket || existingSocket.readyState === WebSocket.CLOSED) {
      // If the socket is not open, create a new one
      const socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
          window.location.host
        }/ws/chat/${userId}/?token=${getCookie('access_token')}`
      );
      globalThis.chatSockets.set(userId, socket);
      // Resolve the promise when the socket is open
      socket.onopen = () => resolve(socket);
      socket.onerror = error => reject(error);
    } else {
      // If the socket is already open, resolve the promise
      resolve(existingSocket);
    }
  });
}

export async function sendDirectMessage(userId, message) {
  const socket = await initializeDirectMessageSocket(userId);
  socket.send(message);
}
