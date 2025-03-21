export class GameManager {
  constructor() {
    this.gameSocket = null;
    this.gameId = null;
    this.localPlayer = null; // 'left' ou 'right'
  }

  async joinGame(gameID) {
    try {
      const response = await fetch('/api/game/join/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: gameID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join game');
      }

      const gameData = await response.json();
      console.log('Joined game:', gameData);

      this.gameId = gameData.game_id;
      this.localPlayer = gameData.player_side; // 'left' ou 'right'
      this.initializeGameSocket(gameData.game_id);

      return gameData;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  }

  async createGame() {
    try {
      const response = await fetch('/api/game/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }

      const gameData = await response.json();
      console.log('Game created:', gameData);

      this.gameId = gameData.game_id;
      this.localPlayer = 'left';
      this.initializeGameSocket(gameData.game_id);

      return gameData;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }
  
  initializeGameSocket(gameId) {
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}${window.location.host}/ws/game/${gameId}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected for game:', gameId);
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      console.log('Received game update:', data);
      
      // Dispatch événement personnalisé
      const gameEvent = new CustomEvent('game-update', { 
        detail: data 
      });
      document.dispatchEvent(gameEvent);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = event => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      
      // Reconnexion ou notification de déconnexion
      if (event.code !== 1000) { // Si ce n'est pas une fermeture normale
        console.log('Attempting to reconnect...');
        setTimeout(() => this.initializeGameSocket(gameId), 3000);
      }
    };

    this.gameSocket = ws;
    return ws;
  }
  
  // Méthode pour envoyer les mouvements de joueur au serveur
  sendPlayerMove(direction) {
    if (!this.gameSocket || this.gameSocket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket connection not open');
      return;
    }
    
    this.gameSocket.send(JSON.stringify({
      type: 'player_move',
      player: this.localPlayer,
      direction: direction // 'up', 'down' ou 'stop'
    }));
  }
  
  // Méthode pour transmettre tout autre événement
  sendGameEvent(eventType, data) {
    if (!this.gameSocket || this.gameSocket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket connection not open');
      return;
    }
    
    this.gameSocket.send(JSON.stringify({
      type: eventType,
      ...data
    }));
  }
}