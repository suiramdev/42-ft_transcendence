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

            
            const tournament = await this.manager.createTournament();

            document.querySelector('.tournament-default-view').style.display = 'none';
            document.querySelector('.tournament-waiting-view').style.display = 'flex';
            // this.updatePlayersList()

        });

        document.getElementById('join-tournament').addEventListener('click', async () => {

            //TODO : get the id 
            const tournamentIdInput = document.getElementById('tournament-id-input');
            if (!tournamentIdInput) {
                console.error('Torunament ID input not found in the DOM');
                return;
              }
            const tournamentId = tournamentIdInput.value.trim();
            const tournament = await this.manager.joinTournament(tournamentId);
        });
    }

    startPlayerUpdateListener() {
        
        function updatePlayersList(players) {
            const playersList = document.getElementById('joined-players-list');
            playersList.innerHTML = '';
            
            players.forEach(player => {
                const li = document.createElement('li');
                li.textContent = player.username;
                playersList.appendChild(li);
            });
            
            // Enable start button if enough players have joined
            if (players.length >= 4) { // Assuming minimum 4 players needed
                document.getElementById('tournament-status').textContent = 'Tournament ready to start!';
                document.getElementById('start-tournament').disabled = false;
            }
        }
    }

    handleGameUpdate(data) {
        switch (data.type) {
            case '':

                break;
        }
    }

}