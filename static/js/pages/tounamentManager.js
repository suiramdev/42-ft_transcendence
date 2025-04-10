import { getCookie } from '../utils/cookies.js';

export class TournamentManager {
  constructor() {
    this.tournamentId = null;
    this.readyState = false;
    this.tournamentSocket = null;
  }

  async createTournament(){
    try {
        const response = await fetch('/api/tournament/', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getCookie('access_token')}`,
              'Content-Type': 'application/json',
            }
          });

        console.log(response);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create tournament');
        }
    
        const tournamentData = await response.json();
        console.log('Tournament created:', tournamentData);

        this.tournamentId = tournamentData.tournament_id;
        this.localPlayer = '0';
        await this.initializeTournamentSocket(tournamentData.tournament_id);

    } catch (error) {
        console.error('Error joining tournament:', error);
      throw error;
    }
  }

  async joinTournament(tournamentId){
    try {
      const response = await fetch('/api/tournament/join/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tournamentId: tournamentId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join tournament');
      }
  
      const tournamentData = await response.json();
      console.log('Tournament joined:', tournamentData);
      
      this.tournamentId = tournamentId;
      this.localPlayer = tournamentData.joined_as.replace('player', '');
      await this.initializeTournamentSocket(tournamentId);
      
      return tournamentData;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }
  
  // Add this new method to send messages through the socket
  sendTournamentMessage(messageData) {
    if (!this.tournamentSocket || this.tournamentSocket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not open');
      return false;
    }
    
    try {
      this.tournamentSocket.send(JSON.stringify(messageData));
      return true;
    } catch (error) {
      console.error('Error sending tournament message:', error);
      return false;
    }
  }
  
  // Add this method for proper cleanup
  disconnectFromTournament() {
    if (this.tournamentSocket) {
      this.tournamentSocket.close(1000, "User left tournament");
      this.tournamentSocket = null;
    }
    this.tournamentId = null;
    this.localPlayer = null;
    this.readyState = false;
  }


  async initializeTournamentSocket(tournamentId) {
    return new Promise((resolve, reject) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const wsUrl = `${wsProtocol}${window.location.host}/ws/tournament/${tournamentId}`;
      console.log("wUrl : " , wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received tournament update:', data);

          // Dispatch a custom event to the tournament page
          const tournamentEvent = new CustomEvent('tournament-update', {
            detail: data,
          });
          document.dispatchEvent(tournamentEvent);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = event => {
        console.log('WebSocket connection closed:', event.code, event.reason);

        // Try to reconnect if it wasn't a normal closure
        if (event.code !== 1000) {
          console.log('Attempting to reconnect...');
          setTimeout(() => this.initializeTournamentSocket(tournamentId), 3000);
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      ws.onopen = () => {
        console.log('WebSocket connected for tournament:', tournamentId);
        this.tournamentSocket = ws;
        resolve(ws);
      };
    });
  }

  sendTournamentEvent(eventType, data = {}) {
    if (!this.tournamentSocket || this.tournamentSocket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket connection not open');
      return;
    }

    this.tournamentSocket.send(
      JSON.stringify({
        type: eventType,
        ...data,
      })
    );
  }

}