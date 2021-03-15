import React, {Component} from 'react';
import './App.css';
import Login from './Login';
import Game from './Game'
import StartGame from "./StartGame";

type appState = {
  currentGame: string | undefined;
  currentPlayer: string | undefined;
  players: string[];
  possibleGames: string[];
}

class App extends Component<any, any>{
  constructor(props: any) {
    super(props);
    this.state = {
      currentGame: '',
      currentPlayer: '',
      players: ['z','f'],
      possibleGames: ['tr']
    }
      }
  joinGame = (player: string, game: string): void => {
    if (this.state.possibleGames.includes(game)) {
      this.setState((previousState: appState) => (
          {
            currentPlayer: player,
            currentGame: game,
            players: [...previousState.players, player]
          }));
    } else {
      this.setState((previousState: appState) => (
          {
            currentPlayer: player,
            currentGame: game,
            players: [...previousState.players, player],
            possibleGames: [...previousState.possibleGames, game]
          }));
    }
  }
  render() {
    return (
        <div className="App">
          {this.state.currentPlayer !== '' ? <StartGame players={this.state.players} currentPlayer={this.state.currentPlayer}/>
                                            : <Login possibleGames={this.state.possibleGames} joinGame={this.joinGame}/>}
        </div>
    );
  }
}

export default App;
