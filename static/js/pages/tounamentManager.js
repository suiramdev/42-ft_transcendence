import { getCookie } from '../utils/cookies.js';

export class TournamentManager {
  constructor() {
    this.tournamentId = null;
    this.readyState = false;
    this.tournamentSocket = null;
    this.players = {}; // To store player information
    this.matches = []; // To store match schedule
    this.currentMatchIndex = -1;
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
        this.localPlayer = '1'; // Creator is always player1
        this.players = { player1: tournamentData.player1 }; // Initialize with creator
        
        // Announce creation in UI
        document.dispatchEvent(new CustomEvent('tournament-update', {
          detail: {
            type: 'players_update',
            players: this.players,
            player_count: 1
          }
        }));
        
        await this.initializeTournamentSocket(tournamentData.tournament_id);
        
        // Announce creation to other potential players via websocket
        this.sendTournamentEvent('tournament_created', {
          tournament_id: this.tournamentId,
          players: this.players
        });

        return tournamentData;
    } catch (error) {
        console.error('Error creating tournament:', error);
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
      this.players = tournamentData.players; // Store all current players
      
      // Update UI immediately with existing players
      document.dispatchEvent(new CustomEvent('tournament-update', {
        detail: {
          type: 'players_update',
          players: this.players,
          player_count: tournamentData.player_count,
          is_full: tournamentData.is_full
        }
      }));
      
      await this.initializeTournamentSocket(tournamentId);
      
      // Announce join to other players
      this.sendTournamentEvent('player_joined', {
        player: tournamentData.joined_as,
        nickname: tournamentData.players[tournamentData.joined_as],
        player_count: tournamentData.player_count
      });
      
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

          // Handle player updates
          if (data.type === 'player_joined') {
            // Update our local player list
            this.players[data.player] = data.nickname;
            
            // Re-dispatch with complete player list
            document.dispatchEvent(new CustomEvent('tournament-update', {
              detail: {
                type: 'players_update',
                players: this.players,
                player_count: data.player_count,
                new_player: data.player
              }
            }));
          } else {
            // Forward other events
            const tournamentEvent = new CustomEvent('tournament-update', {
              detail: data,
            });
            document.dispatchEvent(tournamentEvent);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
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

  /**
   * Generate all possible matches between players in a round-robin format
   * @returns {Array} Array of match objects
   */
  generateMatchSchedule() {
    const playerIds = Object.keys(this.players).map(key => key.replace('player', ''));
    const matches = [];
    
    // Generate all possible pairs (round-robin tournament)
    for (let i = 0; i < playerIds.length; i++) {
      for (let j = i + 1; j < playerIds.length; j++) {
        matches.push({
          id: `match_${matches.length + 1}`,
          player1: `player${playerIds[i]}`,
          player2: `player${playerIds[j]}`,
          player1Name: this.players[`player${playerIds[i]}`],
          player2Name: this.players[`player${playerIds[j]}`],
          status: 'pending',
          winner: null
        });
      }
    }
    
    this.matches = matches;
    console.log('Generated matches:', matches);
    return matches;
  }
  
  /**
   * Start the tournament with the generated matches
   */
  startTournament() {
    // Generate match schedule if not already done
    if (this.matches.length === 0) {
      this.generateMatchSchedule();
    }
    
    // Send the complete match schedule to all clients
    this.sendTournamentEvent('tournament_start', {
      matches: this.matches
    });
    
    // Start with the first match
    this.currentMatchIndex = 0;
    this.sendTournamentEvent('match_starting', {
      matchIndex: this.currentMatchIndex,
      match: this.matches[this.currentMatchIndex]
    });
  }
  
  /**
   * Move to the next match in the tournament
   */
  advanceToNextMatch() {
    if (this.currentMatchIndex < this.matches.length - 1) {
      this.currentMatchIndex++;
      this.sendTournamentEvent('match_starting', {
        matchIndex: this.currentMatchIndex,
        match: this.matches[this.currentMatchIndex]
      });
      return this.matches[this.currentMatchIndex];
    } else {
      // Tournament is complete
      this.sendTournamentEvent('tournament_complete', {
        matches: this.matches
      });
      return null;
    }
  }
  
  /**
   * Record the result of a match
   * @param {number} matchIndex - Index of the match
   * @param {string} winner - ID of the winning player (e.g., 'player1')
   */
  recordMatchResult(matchIndex, winner) {
    if (matchIndex >= 0 && matchIndex < this.matches.length) {
      this.matches[matchIndex].status = 'completed';
      this.matches[matchIndex].winner = winner;
      
      this.sendTournamentEvent('match_result', {
        matchIndex,
        match: this.matches[matchIndex],
        winner,
        winnerName: this.players[winner]
      });
    }
  }

}