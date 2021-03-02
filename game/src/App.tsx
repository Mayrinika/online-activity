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
    this.joinGame = this.joinGame.bind(this);
  }
  joinGame(player: string, game: string) {
    if (this.state.possibleGames.includes(game)) {
      this.setState((st: appState) => (
          {
            currentPlayer: player,
            currentGame: game,
            players: [...st.players, player]
          }));
    } else {
      this.setState((st: appState) => (
          {
            currentPlayer: player,
            currentGame: game,
            players: [...st.players, player],
            possibleGames: [...st.possibleGames, game]
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
