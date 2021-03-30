import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
//components
import Login from '../Login/Login';
import StartGame from "../StartGame/StartGame";
import Game from "../Game/Game";
import GameOver from "../GameOver/GameOver";
import Leaderboard from "../Leaderboard/Leaderboard";
//utils
import getRoutes from '../../utils/routes';
//styles
import './App.css';

interface GameType {
    id: string;
    players: string[];
}

interface AppState {
    currentGameId: string;
    currentPlayer: string;
    possibleGames: GameType[];
}

class App extends Component<{}, AppState> {
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
    }

    addGame = async (gameId: string) => {
        await fetch(getRoutes(gameId).gameId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
    }

    getAllGames = async () => {
        const res = await fetch(getRoutes().app);
        const data = await res.text();
        this.setState({possibleGames: JSON.parse(data)});
    }

    joinGame = async (player: string, gameId: string) => {
        await this.getAllGames();
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
                <Switch>
                    <Route path='/leaderboard' component={Leaderboard}/>
                    <Route path='/:gameId/game' render={(props) => (
                        <Game {...props}/>
                    )}/>
                    <Route path='/:gameId/game-over' render={(props) => (
                        <GameOver {...props}/>
                    )}/>
                    <Route path='/:gameId' render={(props) => (
                        <StartGame {...props}/>
                    )}/>
                    <Route exact path='/' render={(props) => (
                        <Login {...props} joinGame={this.joinGame}/>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
