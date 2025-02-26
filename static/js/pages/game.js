import { Page } from '../core/Page.js';

export class GamePage extends Page {
  constructor() {
    super('game.html', 'game.css');
  }

  onMount() {
    console.log("script");
    const apiUrl = "/api/game/me/";
    const startGame = document.getElementById('start-game');
    startGame.addEventListener("click", function (e) {
      const requestOptions = {
        method: 'GET',
      };
    fetch(apiUrl, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });

    });
  }
}

