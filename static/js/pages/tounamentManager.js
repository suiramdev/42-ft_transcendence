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
      // Send a leave event before closing
      this.sendTournamentEvent('player_leaving', {
        player: `player${this.localPlayer}`,
        tournament_id: this.tournamentId
      });
      
      // Close the socket
      this.tournamentSocket.close(1000, "User left tournament");
      this.tournamentSocket = null;
    }
    
    this.tournamentId = null;
    this.localPlayer = null;
    this.readyState = false;
    this.players = {};
  }


  async initializeTournamentSocket(tournamentId) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}${window.location.host}/ws/tournament/${tournamentId}`;
    console.log("wUrl : ", wsUrl);

    this.tournamentSocket = new WebSocket(wsUrl);

    this.tournamentSocket.onopen = () => {
      console.log('Tournament WebSocket connection established');
    };
  
    this.tournamentSocket.onclose = (event) => {
      console.log('Tournament WebSocket connection closed:', event.code, event.reason);
    };
  
    this.tournamentSocket.onerror = (error) => {
      console.error('Tournament WebSocket error:', error);
    };

    // Modify the onmessage handler in initializeTournamentSocket method
    this.tournamentSocket.onmessage = event => {
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
        } else if (data.type === 'player_ready') {
          // Update ready players list
          this.readyPlayers = data.readyPlayers;
          
          // Dispatch event to update UI
          document.dispatchEvent(new CustomEvent('tournament-update', {
            detail: {
              type: 'ready_update',
              player: data.player,
              isReady: data.isReady,
              readyPlayers: data.readyPlayers,
              matchIndex: data.matchIndex
            }
          }));
          
          // Check if match can start
          if (this.readyPlayers.length === 2) {
            // Auto-start match after short delay
            setTimeout(() => {
              this.startMatch();
            }, 1000);
          }
        }else if (data.type === 'match_ready') {
          // A new match is ready to accept ready states
          this.readyPlayers = data.readyPlayers || [];
          
          // Dispatch event to update UI
          document.dispatchEvent(new CustomEvent('tournament-update', {
            detail: {
              type: 'match_ready',
              matchIndex: data.matchIndex,
              match: data.match,
              readyPlayers: this.readyPlayers
            }
          }));
        } else if (data.type === 'tournament_start') {
          // Store all match data
          this.matches = data.matches;
          this.currentMatchIndex = 0;
          
          document.dispatchEvent(new CustomEvent('tournament-update', {
            detail: {
              type: 'tournament_start',
              matches: this.matches
            }
          }));
        }
        else if (data.type === 'player_left') {
          // Remove player from our list
          if (this.players[data.player]) {
            delete this.players[data.player];
          }

          // Re-dispatch the event
          document.dispatchEvent(new CustomEvent('tournament-update', {
            detail: {
              type: 'players_update',
              players: this.players,
              player_count: Object.keys(this.players).length,
              left_player: data.player,
              player_name: data.player_name
            }
          }));
        }
        else if (data.type === 'tournament_closed') {
          // The tournament has been closed by the server
          document.dispatchEvent(new CustomEvent('tournament-update', {
            detail: {
              type: 'tournament_closed',
              reason: data.reason
            }
          }));
          
          // Clean up local state
          this.disconnectFromTournament();
        }
        else {
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

  startTournament() {
    // Generate match schedule if not already done
    if (this.matches.length === 0) {
      this.generateMatchSchedule();
    }
    
    // Initialize ready players array
    this.readyPlayers = [];
    
    // Send the complete match schedule to all clients
    this.sendTournamentEvent('tournament_start', {
      matches: this.matches
    });
    
    // Start with the first match
    this.currentMatchIndex = 0;
    this.sendTournamentEvent('match_ready', {
      matchIndex: this.currentMatchIndex,
      match: this.matches[this.currentMatchIndex],
      readyPlayers: this.readyPlayers
    });
  }
  
  /**
   * Toggle the ready state for the local player
   */
  toggleReady() {
    // Get the current match
    const currentMatch = this.matches[this.currentMatchIndex];
    if (!currentMatch) return false;
    
    // Check if this player is participating in the current match
    const myPlayerKey = `player${this.localPlayer}`;
    const isParticipant = currentMatch.player1 === myPlayerKey || currentMatch.player2 === myPlayerKey;
    
    if (!isParticipant) {
      console.log('You are not participating in this match');
      return false;
    }
    
    // Toggle ready state
    const isReady = this.readyPlayers.includes(myPlayerKey);
    
    if (isReady) {
      // Remove from ready array
      this.readyPlayers = this.readyPlayers.filter(player => player !== myPlayerKey);
    } else {
      // Add to ready array
      this.readyPlayers.push(myPlayerKey);
    }
    
    // Broadcast new ready state
    this.sendTournamentEvent('player_ready', {
      matchIndex: this.currentMatchIndex,
      player: myPlayerKey,
      isReady: !isReady,
      readyPlayers: this.readyPlayers
    });
    
    return !isReady; // Return new ready state
  }
  
  /**
   * Check if both players in the current match are ready
   */
  checkMatchReady() {
    const currentMatch = this.matches[this.currentMatchIndex];
    if (!currentMatch) return false;
    
    const player1Ready = this.readyPlayers.includes(currentMatch.player1);
    const player2Ready = this.readyPlayers.includes(currentMatch.player2);
    
    return player1Ready && player2Ready;
  }
  
  /**
   * Start the current match if both players are ready
   */
  startMatch() {
    if (!this.checkMatchReady()) return false;
    
    // Notify all clients that the match is starting
    this.sendTournamentEvent('match_starting', {
      matchIndex: this.currentMatchIndex,
      match: this.matches[this.currentMatchIndex]
    });
    
    // Reset ready players for next match
    this.readyPlayers = [];
    
    return true;
  }
  
  /**
   * Move to the next match in the tournament
   */
  advanceToNextMatch() {
    if (this.currentMatchIndex < this.matches.length - 1) {
      this.currentMatchIndex++;
      // Reset ready players
      this.readyPlayers = [];
      
      this.sendTournamentEvent('match_ready', {
        matchIndex: this.currentMatchIndex,
        match: this.matches[this.currentMatchIndex],
        readyPlayers: this.readyPlayers
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
  

}







