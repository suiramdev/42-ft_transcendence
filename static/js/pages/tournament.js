import { updatePos } from '../components/game.js';
import { Page } from '../core/Page.js';
import { TournamentManager } from './tounamentManager.js';

export class TournamentPage extends Page {
    constructor (){
        super('tournament.html', 'tournament.css');
        this.manager = new TournamentManager();
        this.tournamentId = null;
    }

    onMount() {
        document.addEventListener('tournament-update', event => {
            this.handleTournamentUpdate(event.detail);
        });

        document.getElementById('create-tournament').addEventListener('click', async () => {
            try {
                const tournament = await this.manager.createTournament();
                
                const tournamentStatus = document.getElementById('tournament-status');
                tournamentStatus.textContent = `Tournament ID: ${this.manager.tournamentId} - Waiting for players...`;
                
                document.querySelector('.tournament-default-view').style.display = 'none';
                document.querySelector('.tournament-waiting-view').style.display = 'flex';
            } catch (error) {
                console.error('Failed to create tournament:', error);
            }
        });

        document.getElementById('join-tournament').addEventListener('click', async () => {
            try {
                const tournamentIdInput = document.getElementById('tournament-id-input');
                if (!tournamentIdInput) {
                    console.error('Tournament ID input not found in the DOM');
                    return;
                }
                
                const tournamentId = tournamentIdInput.value.trim();
                if (!tournamentId) {
                    alert('Please enter a Tournament ID');
                    return;
                }
                
                const tournament = await this.manager.joinTournament(tournamentId);
                
                // Switch to waiting view
                document.querySelector('.tournament-default-view').style.display = 'none';
                document.querySelector('.tournament-waiting-view').style.display = 'flex';
            } catch (error) {
                alert(`Failed to join tournament: ${error.message}`);
                console.error('Failed to join tournament:', error);
            }
        });
        
        // Add leave tournament handler
        document.getElementById('leave-tournament').addEventListener('click', () => {
            if (this.manager.tournamentSocket) {
                this.manager.disconnectFromTournament();
                
                // Switch back to default view
                document.querySelector('.tournament-default-view').style.display = 'flex';
                document.querySelector('.tournament-waiting-view').style.display = 'none';
            }
        });
        
        // Add start tournament handler
        document.getElementById('start-tournament').addEventListener('click', () => {
            if (this.manager.tournamentSocket) {
                this.manager.sendTournamentEvent('start_tournament');
            }
        });
    }

    handleTournamentUpdate(data) {
        console.log('Tournament update received:', data);
        
        switch (data.type) {
            case 'players_update':
                this.updatePlayersList(data.players, data.player_count);
                
                // Enable/disable start button based on player count
                const startButton = document.getElementById('start-tournament');
                startButton.disabled = data.player_count < 4;
                
                // Update tournament status text
                const statusElement = document.getElementById('tournament-status');
                if (data.player_count < 4) {
                    statusElement.textContent = `Waiting for more players... (${data.player_count}/4)`;
                } else {
                    statusElement.textContent = 'Tournament ready! Click Start to begin.';
                }
                break;
                
            case 'start_tournament':
                // Handle tournament start - we'll implement this later
                console.log('Tournament starting!');
                break;
                
            default:
                console.log('Unhandled tournament update type:', data.type);
        }
    }
    
    updatePlayersList(players, playerCount) {
        const playersList = document.getElementById('joined-players-list');
        playersList.innerHTML = '';
        
        // Convert object to array for easier sorting
        const playersArray = Object.entries(players).map(([position, nickname]) => ({
            position: parseInt(position.replace('player', '')), 
            nickname
        }));
        
        // Sort by position
        playersArray.sort((a, b) => a.position - b.position);
        
        // Create list items
        playersArray.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `Player ${player.position}: ${player.nickname}`;
            
            // Highlight local player
            if (player.position.toString() === this.manager.localPlayer) {
                li.classList.add('local-player');
                li.textContent += ' (You)';
            }
            
            playersList.appendChild(li);
        });
        
        // Add placeholders for missing players
        for (let i = playerCount + 1; i <= 4; i++) {
            const li = document.createElement('li');
            li.textContent = `Player ${i}: Waiting...`;
            li.classList.add('waiting-player');
            playersList.appendChild(li);
        }
    }
}