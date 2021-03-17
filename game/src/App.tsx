import React, {Component} from 'react';
import './App.css';
import Login from './Login';
import StartGame from "./StartGame";
const serverURL = "http://localhost:9000/"

type gameType = {
    id: string;
    players: string[];
}

type appState = {
  currentGameId: string;
  currentPlayer: string;
  possibleGames: gameType[];
};

class App extends Component<{}, appState>{
    constructor(props: {}) {
        super(props);
        this.state = {
          currentGameId: '',
          currentPlayer: '',
          possibleGames: []
        }
    }
    async componentDidMount() {
        await this.getAllGames();
    }
    addPlayer = async (gameId: string, player: string) => {
        await fetch(`${serverURL}${gameId}/addPlayer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({player})
        });
        await this.getAllGames();
    }
    addGame = async (gameId: string) => {
        await fetch(`${serverURL}${gameId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            //body: JSON.stringify({})
        });
        await this.getAllGames();
    }
    getAllGames = async () => {
        const res = await fetch(serverURL);
        const data = await res.text();
        this.setState({ possibleGames: JSON.parse(data)});
    }
    joinGame = async (player: string, gameId: string) => {
        if (this.state.possibleGames.some(game => game.id === gameId)) {
            await this.addPlayer(gameId, player);
        } else {
            await this.addGame(gameId);
            await this.addPlayer(gameId, player);
        }
        this.setState({
            currentPlayer: player,
            currentGameId: gameId,
        });
    }
    render() {
        return (
            <div className="App">
                {this.state.currentPlayer !== '' ? <StartGame currentGameId={this.state.currentGameId} currentPlayer={this.state.currentPlayer}/>
                                                : <Login possibleGames={this.state.possibleGames} joinGame={this.joinGame}/>}
            </div>
        );
    }
}

export default App;
