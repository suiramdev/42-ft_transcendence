import { Game, tournamentAnimate} from './local-game.js';

export class Tournament {
  constructor(player1, player2, player3, player4) {
    this.player1 = player1;
    this.player2 = player2;
    this.player3 = player3;
    this.player4 = player4;
    this.loser1 = null;
    this.loser2 = null;
    this.loser3 = null;
    this.winner1 = null;
    this.winner2 = null;
    this.match = 0;
    this.third = null;
    this.scnd = null;
    this.champion = null;

    this.matchAnnouncement = document.getElementById('match-announcement');
    this.gameContainer = document.getElementById('tournament-game-container');
    this.endGameScreen = document.getElementById('tournament-end-game-screen');
    this.resultsScreen = document.getElementById('tournament-results');

    this.setupNextMatchButton();
  }

  startMatch() {
    if (document.getElementById('player-registration').style.display === 'block') {
      document.getElementById('player-registration').style.display = 'none';
    }
    if (this.endGameScreen.style.display === 'flex') {
      this.endGameScreen.style.display = 'none';
    }

    document.getElementById('match-number').textContent = this.match + 1;

    this.matchAnnouncement.style.display = 'block';

    const matchPlayer1 = document.getElementById('match-player1');
    const matchPlayer2 = document.getElementById('match-player2');

    if (this.match === 0) {
      matchPlayer1.textContent = this.player1;
      matchPlayer2.textContent = this.player2;
    } else if (this.match === 1) {
      matchPlayer1.textContent = this.player3;
      matchPlayer2.textContent = this.player4;
    } else if (this.match === 2) {
      matchPlayer1.textContent = this.winner1;
      matchPlayer2.textContent = this.winner2;
    }

    const startMatchBtn = document.getElementById('start-match');
    const newStartBtn = startMatchBtn.cloneNode(true);
    startMatchBtn.parentNode.replaceChild(newStartBtn, startMatchBtn);

    newStartBtn.addEventListener('click', () => this.startGame());
  }
  
  startGame() {
    this.matchAnnouncement.style.display = 'none';
    this.gameContainer.style.display = 'block';
    const canvas = document.getElementById('pongCanvas');
    canvas.width = 1400;
    canvas.height = 1000;

    if (this.match === 0) {
        this.gameInstance = new Game(0.1, 3, 0.3, 0.5, 1, this.player1, this.player2);
    } else if (this.match === 1) {
        this.gameInstance = new Game(0.1, 3, 0.3, 0.5, 1, this.player3, this.player4);
    }else if (this.match === 2){
        this.gameInstance = new Game(0.1, 3, 0.3, 0.5, 1, this.loser1, this.loser2);
    } else {
        this.gameInstance = new Game(0.1, 3, 0.3, 0.5, 1, this.winner1, this.winner2);
    }
    this.gameInstance.renderer.setSize(canvas.width, canvas.height);
    this.gameInstance.camera.aspect = canvas.width / canvas.height;
    this.gameInstance.camera.updateProjectionMatrix();

    this.gameInstance.isGameRunning = true;
    tournamentAnimate(this.gameInstance, 1, () => {
        this.endGame();
      });
  }

  endGame() {
    this.gameContainer.style.display = 'none';

    const leftScore = this.gameInstance.playerLeft.getScore();
    const rightScore = this.gameInstance.playerRight.getScore();

    const isLeftWinner = leftScore > rightScore;
    
    const winnerNameElement = document.getElementById('winner-name');

    if (this.match === 0) {
        if (isLeftWinner){
            this.winner1 = this.gameInstance.leftPlayerNickname;
            this.loser1 = this.gameInstance.rightPlayerNickname;
        }else{
            this.winner1 = this.gameInstance.rightPlayerNickname;
            this.loser1 = this.gameInstance.leftPlayerNickname;
        }
        const loserfinalist1 = document.getElementById('bracket-loserfinalist1');
        if (loserfinalist1) loserfinalist1.textContent = this.loser2;
        const finalist1 = document.getElementById('bracket-finalist1');
        if (finalist1) finalist1.textContent = this.winner1;
        winnerNameElement.textContent = `${this.winner1} Wins!`;
    } 
    else if (this.match === 1) {
        if (isLeftWinner){
            this.winner2 = this.gameInstance.leftPlayerNickname;
            this.loser2 = this.gameInstance.rightPlayerNickname;
        }else{
            this.winner2 = this.gameInstance.rightPlayerNickname;
            this.loser2 = this.gameInstance.leftPlayerNickname;
        }
        const loserfinalist2 = document.getElementById('bracket-loserfinalist2');
        if (loserfinalist2) loserfinalist2.textContent = this.loser2;
        const finalist2 = document.getElementById('bracket-finalist2');
        if (finalist2) finalist2.textContent = this.winner2;
        winnerNameElement.textContent = `${this.winner1} Wins!`;
    }
    else if (this.match === 2){
        if (isLeftWinner){
            this.third = this.gameInstance.leftPlayerNickname;
            this.loser3 = this.gameInstance.rightPlayerNickname;
        }else{
            this.third = this.gameInstance.rightPlayerNickname;
            this.loser3 = this.gameInstance.leftPlayerNickname;
        }

    }
    else if (this.match === 3) {
        if (isLeftWinner){
            this.champion = this.winner1;
            this.scnd = this.winner2;      
        }else {
            this.champion = this.winner2;
            this.scnd = this.winner1;
        }

        this.showTournamentResults(this.champion, this.scnd);
        return;
    }
    

    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
      finalScoreElement.textContent = `${this.gameInstance.leftPlayerNickname} ${leftScore} - ${rightScore} ${this.gameInstance.rightPlayerNickname}`;
    }

    this.endGameScreen.style.display = 'flex';
    
    // Set up the next match button
    this.setupNextMatchButton();
  }

  setupNextMatchButton() {
    // Get the next match button
    const nextMatchButton = document.getElementById('next-match');
    
    // Remove any existing event listeners
    const newNextButton = nextMatchButton.cloneNode(true);
    nextMatchButton.parentNode.replaceChild(newNextButton, nextMatchButton);
    
    // Add event listener to go to next match
    newNextButton.addEventListener('click', () => {
      // Hide end game screen
      this.endGameScreen.style.display = 'none';
      
      // Advance to next match
      this.match++;
      
      // Start the next match
      this.startMatch();
    });
  }

  showTournamentResults(champion, runnerUp) {
    // Hide other screens
    this.gameContainer.style.display = 'none';
    this.endGameScreen.style.display = 'none';
    
    // Update winner display
    document.getElementById('champion-name').textContent = champion;
    document.getElementById('first-place-name').textContent = champion;
    document.getElementById('second-place-name').textContent = runnerUp;
    
    // For third place, we use one of the semifinal losers
    document.getElementById('third-place-name').textContent = this.loser3;
    
    // Update the results bracket
    document.getElementById('result-player1').textContent = this.player1;
    document.getElementById('result-player2').textContent = this.player2;
    document.getElementById('result-player3').textContent = this.player3;
    document.getElementById('result-player4').textContent = this.player4;
    document.getElementById('result-loserfinalist1').textContent = this.loser1;
    document.getElementById('result-loserfinalist2').textContent = this.loser2;
    document.getElementById('result-finalist1').textContent = this.winner1;
    document.getElementById('result-finalist2').textContent = this.winner2;
    
    // Mark the champion in the bracket
    if (champion === this.winner1) {
      document.getElementById('result-finalist1').classList.add('winner');
      document.getElementById('result-finalist2').classList.remove('winner');
    } else {
      document.getElementById('result-finalist2').classList.add('winner');
      document.getElementById('result-finalist1').classList.remove('winner');
    }
    
    // Show results screen
    this.resultsScreen.style.display = 'block';
    
    // Add event listeners for results buttons
    this.setupResultsButtons();
  }
  
  setupResultsButtons() {
    // New tournament button
    const newTournamentBtn = document.getElementById('new-tournament');
    newTournamentBtn.addEventListener('click', () => {
      this.resultsScreen.style.display = 'none';
      document.getElementById('player-registration').style.display = 'block';
      this.resetTournament();
    });
    
    // Main menu button
    const mainMenuBtn = document.getElementById('main-menu');
    mainMenuBtn.addEventListener('click', () => {
      this.resultsScreen.style.display = 'none';
      document.getElementById('tournament-menu').style.display = 'block';
      this.resetTournament();
    });
  }
  
  resetTournament() {
    this.winner1 = null;
    this.winner2 = null;
    this.loser1 = null;
    this.loser2 = null;
    this.match = 0;
    this.champion = null;
    
    // Reset bracket display
    document.getElementById('bracket-finalist1').textContent = 'Winner 1';
    document.getElementById('bracket-finalist2').textContent = 'Winner 2';
    
    // Clear player inputs
    document.getElementById('player1').value = '';
    document.getElementById('player2').value = '';
    document.getElementById('player3').value = '';
    document.getElementById('player4').value = '';
    
    // Reset bracket players
    document.getElementById('bracket-player1').textContent = 'Player 1';
    document.getElementById('bracket-player2').textContent = 'Player 2';
    document.getElementById('bracket-player3').textContent = 'Player 3';
    document.getElementById('bracket-player4').textContent = 'Player 4';
  }
}