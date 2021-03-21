import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
//components
import Login from '../Login/Login';
import StartGame from "../StartGame/StartGame";
//utils
import getRoutes from '../../utils/routes';
//styles
import './App.css';

interface gameType {
    id: string;
    players: string[];
}

interface appState {
    currentGameId: string;
    currentPlayer: string;
    possibleGames: gameType[];
}

class App extends Component<{}, appState> {
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
        await fetch(getRoutes(gameId).addPlayer, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({player})
        });
        await this.getAllGames();
    }

    addGame = async (gameId: string) => {
        await fetch(getRoutes(gameId).gameId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            //body: JSON.stringify({})
        });
        await this.getAllGames();
    }

    getAllGames = async () => {
        const res = await fetch(getRoutes().root);
        const data = await res.text();
        this.setState({possibleGames: JSON.parse(data)});
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
        const {currentGameId, currentPlayer, possibleGames} = this.state;
        return (
            <div className="App">
                <Switch>
                    <Route path='/game/:gameId'>
                        <StartGame currentGameId={currentGameId} currentPlayer={currentPlayer}/>
                    </Route>
                    <Route exact path='/' render={(props) => (
                        <Login {...props} possibleGames={possibleGames} joinGame={this.joinGame}
                               getAllGames={this.getAllGames}/>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
