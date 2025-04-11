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

        document.getElementById('ready-button').addEventListener('click', () => {
            const isReady = this.manager.toggleReady();
            const button = document.getElementById('ready-button');
            
            if (isReady) {
                button.textContent = 'Cancel Ready';
                button.classList.add('ready');
            } else {
                button.textContent = 'Ready';
                button.classList.remove('ready');
            }
        });
    }

    // Add this case to your handleTournamentUpdate method
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
                
                // Show notification if a player left
                if (data.left_player) {
                    this.showNotification(`${data.player_name || 'A player'} has left the tournament.`);
                }
                break;
            
            case 'tournament_start':
                this.showNotification('Tournament is starting!');
                this.renderMatchesList(data.matches);
                
                // Switch to match view
                document.querySelector('.tournament-default-view').style.display = 'none';
                document.querySelector('.tournament-waiting-view').style.display = 'none';
                document.querySelector('.tournament-match-view').style.display = 'flex';
                break;

            case 'match_ready':
                // Update current match display
                this.updateCurrentMatchDisplay(data.match);
                
                // Reset ready status UI
                this.updateReadyStatus(data.readyPlayers || []);
                
                // Reset ready button for local player
                const readyButton = document.getElementById('ready-button');
                readyButton.textContent = 'Ready';
                readyButton.classList.remove('ready');
                
                // Only enable ready button if local player is in this match
                const myPlayerKey = `player${this.manager.localPlayer}`;
                const isParticipant = data.match.player1 === myPlayerKey || data.match.player2 === myPlayerKey;
                readyButton.disabled = !isParticipant;
                if (!isParticipant) {
                    readyButton.textContent = 'Waiting for other players';
                }
                
                this.showNotification(`Match ready: ${data.match.player1Name} vs ${data.match.player2Name}`);
                break;
            
            case 'ready_update':
                // Update ready indicators
                this.updateReadyStatus(data.readyPlayers);
                
                // Show notification
                const playerName = this.manager.players[data.player];
                this.showNotification(`${playerName} is ${data.isReady ? 'ready' : 'not ready'}`);
                break;

            
            case 'match_starting':
                this.showNotification(`Match starting! ${data.match.player1Name} vs ${data.match.player2Name}`);
                
                // Update match status
                this.updateMatchStatus(data.matchIndex, 'in-progress');
                
                // Disable ready button during match
                document.getElementById('ready-button').disabled = true;
                document.getElementById('ready-button').textContent = 'Match in progress';
                break;

            case 'match_result':
                this.showNotification(`Match result: ${data.winnerName} wins!`);
                
                // Update match status
                this.updateMatchStatus(data.matchIndex, 'completed', data.winner);
                
                // Advance to next match after delay
                setTimeout(() => {
                    this.manager.advanceToNextMatch();
                }, 3000);
                break;


            case 'tournament_closed':
                this.showNotification('Tournament has been closed: ' + data.reason);
                
                // Add to closed tournaments list
                if (this.manager.tournamentId && !this.closedTournaments.includes(this.manager.tournamentId)) {
                    this.closedTournaments.push(this.manager.tournamentId);
                    localStorage.setItem('closedTournaments', JSON.stringify(this.closedTournaments));
                }
                
                // Switch back to default view
                document.querySelector('.tournament-default-view').style.display = 'flex';
                document.querySelector('.tournament-waiting-view').style.display = 'none';
                document.querySelector('.tournament-match-view').style.display = 'none';
                break;
            
            case 'tournament_complete':
                this.showNotification('Tournament is complete!');
                
                // Show final results
                this.showTournamentResults(data.matches);
                break;
                
            default:
                console.log('Unhandled tournament update type:', data.type);
        }
    }

    // Add a helper method for notifications
    showNotification(message) {
        // You can implement this based on your UI design
        // For example:
        const notification = document.createElement('div');
        notification.className = 'tournament-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after a few seconds
        setTimeout(() => {
            notification.classList.add('fadeout');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
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

    updateCurrentMatchDisplay(match) {
        const matchInfo = document.getElementById('current-match-info');
        
        // Set player names
        matchInfo.querySelector('.player1 .player-name').textContent = match.player1Name;
        matchInfo.querySelector('.player2 .player-name').textContent = match.player2Name;
        
        // Reset ready status
        matchInfo.querySelector('.player1 .ready-status').textContent = 'Not Ready';
        matchInfo.querySelector('.player2 .ready-status').textContent = 'Not Ready';
        matchInfo.querySelector('.player1 .ready-status').className = 'ready-status not-ready';
        matchInfo.querySelector('.player2 .ready-status').className = 'ready-status not-ready';
        
        // Highlight local player if participating
        const myPlayerKey = `player${this.manager.localPlayer}`;
        if (match.player1 === myPlayerKey) {
            matchInfo.querySelector('.player1').classList.add('local-player');
            matchInfo.querySelector('.player2').classList.remove('local-player');
        } else if (match.player2 === myPlayerKey) {
            matchInfo.querySelector('.player2').classList.add('local-player');
            matchInfo.querySelector('.player1').classList.remove('local-player');
        } else {
            matchInfo.querySelector('.player1').classList.remove('local-player');
            matchInfo.querySelector('.player2').classList.remove('local-player');
        }
    }

    updateReadyStatus(readyPlayers) {
        const matchInfo = document.getElementById('current-match-info');
        const currentMatch = this.manager.matches[this.manager.currentMatchIndex];
        if (!currentMatch) return;
        
        // Update player1 ready status
        if (readyPlayers.includes(currentMatch.player1)) {
            matchInfo.querySelector('.player1 .ready-status').textContent = 'Ready';
            matchInfo.querySelector('.player1 .ready-status').className = 'ready-status ready';
        } else {
            matchInfo.querySelector('.player1 .ready-status').textContent = 'Not Ready';
            matchInfo.querySelector('.player1 .ready-status').className = 'ready-status not-ready';
        }
        
        // Update player2 ready status
        if (readyPlayers.includes(currentMatch.player2)) {
            matchInfo.querySelector('.player2 .ready-status').textContent = 'Ready';
            matchInfo.querySelector('.player2 .ready-status').className = 'ready-status ready';
        } else {
            matchInfo.querySelector('.player2 .ready-status').textContent = 'Not Ready';
            matchInfo.querySelector('.player2 .ready-status').className = 'ready-status not-ready';
        }
    }

    renderMatchesList(matches) {
        const matchesList = document.getElementById('matches-list');
        matchesList.innerHTML = '';
        
        matches.forEach((match, index) => {
            const li = document.createElement('li');
            li.id = `match-${index}`;
            li.className = 'match-item';
            li.dataset.status = match.status;
            
            li.innerHTML = `
                <span class="match-number">Match ${index + 1}</span>
                <div class="match-players-mini">
                    <span class="match-player-name">${match.player1Name}</span>
                    <span class="vs">vs</span>
                    <span class="match-player-name">${match.player2Name}</span>
                </div>
                <span class="match-status">${match.status}</span>
            `;
            
            // Highlight current match
            if (index === this.manager.currentMatchIndex) {
                li.classList.add('current-match');
            }
            
            matchesList.appendChild(li);
        });
    }

    updateMatchStatus(matchIndex, status, winner = null) {
        const matchItem = document.getElementById(`match-${matchIndex}`);
        if (!matchItem) return;
        
        // Update match in data model
        if (this.manager.matches[matchIndex]) {
            this.manager.matches[matchIndex].status = status;
            if (winner) {
                this.manager.matches[matchIndex].winner = winner;
            }
        }
        
        // Update UI
        matchItem.dataset.status = status;
        const statusSpan = matchItem.querySelector('.match-status');
        statusSpan.textContent = status;
        
        if (winner) {
            const winnerName = this.manager.players[winner];
            statusSpan.textContent = `Winner: ${winnerName}`;
        }
    }

    showTournamentResults(matches) {
        // You can implement a more elaborate UI for final results
        // For now, just display completed matches
        const matchesList = document.getElementById('matches-list');
        const resultsHeading = document.createElement('h2');
        resultsHeading.textContent = 'Tournament Results';
        matchesList.parentNode.insertBefore(resultsHeading, matchesList);
        
        // Disable ready button at tournament end
        const readyButton = document.getElementById('ready-button');
        readyButton.disabled = true;
        readyButton.textContent = 'Tournament Complete';
    }
}