import React, {Component} from 'react';
import './App.css';
import Login from './Login';
import StartGame from "./StartGame";

type appState = {
  currentGameId: string;
  currentPlayer: string;
  players: string[];
  possibleGames: string[];
};

type appProps = {};

class App extends Component<appProps, appState>{
  constructor(props: appProps) {
    super(props);
    this.state = {
      currentGameId: '',
      currentPlayer: '',
      players: ['z','f'],
      possibleGames: ['tr']
    }
      }
  joinGame = (player: string, gameId: string): void => {
    if (this.state.possibleGames.includes(gameId)) {
      this.setState((previousState: appState) => (
          {
            currentPlayer: player,
            currentGameId: gameId,
            players: [...previousState.players, player]
          }));
    } else {
      this.setState((previousState: appState) => (
          {
            currentPlayer: player,
            currentGameId: gameId,
            players: [...previousState.players, player],
            possibleGames: [...previousState.possibleGames, gameId]
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
