import { getCookie } from '../utils/cookies.js';

export class TournamentManager {
  constructor() {
    this.tournamentId = null;
    this.readyState = false;
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
        console.log('Game created:', tournamentData);

        this.tournamentId = tournamentData.tournament_id;
        this.localPlayer = '0';

    } catch (error) {
        console.error('Error joining game:', error);
      throw error;
    }
  }

  async joinTournament(tournamentId){
    try {
        const response = await fetch('/api/tournament/join', {
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


    } catch (error) {
        console.error('Error joining game:', error);
      throw error;
    }
  }
}