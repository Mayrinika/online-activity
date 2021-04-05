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
import getDomRoutes from "../../utils/domRoutes";
//styles
import './App.css';

let ws: any;

interface GameType {
    id: string;
    players: string[];
}

interface AppState {
    possibleGames: GameType[];
}

class App extends Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            possibleGames: []
        }
    }

    async componentDidMount() {
        await this.getAllGames();
    }

    addPlayer = async (gameId: string, player: string) => {
        ws = new WebSocket('ws://localhost:8080');
        const send = function (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
            waitForConnection(function () {
                return ws.send(message);
            }, 100);
        };

        const waitForConnection = function (callback: () => void, interval: number) {
            if (ws.readyState === 1) {
                callback();
            } else {
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        send(JSON.stringify({'gameId':gameId,'messageType':'register', 'player':player}));
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
    }

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route path={getDomRoutes().leaderboard} component={Leaderboard}/>
                    <Route path={getDomRoutes(':gameId').game} render={(props) => (
                        <Game {...props} ws={ws}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').gameOver} render={(props) => (
                        <GameOver {...props}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').startGame} render={(props) => (
                        <StartGame {...props} ws={ws}/>
                    )}/>
                    <Route exact path={getDomRoutes().login} render={(props) => (
                        <Login {...props} joinGame={this.joinGame}/>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
