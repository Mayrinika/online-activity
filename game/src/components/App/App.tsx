import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
//components
import Main from '../Main/Main';
import Login from "../Login/login";
import Signup from "../Signup/signup";
import StartGame from "../StartGame/StartGame";
import Game from "../Game/Game";
import GameOver from "../GameOver/GameOver";
import Leaderboard from "../Leaderboard/Leaderboard";
import SuggestWord from "../SuggestWord/SuggestWord";
import {ApiContext} from '../Api/ApiProvider';
//utils
import getDomRoutes from "../../utils/domRoutes";
import websocket from "../../utils/websocket";
import {GameType} from '../../utils/Types/types';
//styles
import './App.css';

let ws: WebSocket;

interface AppState {
    possibleGames: GameType[];
}

class App extends Component<{}, AppState> {
    static contextType = ApiContext;

    constructor(props: {}) {
        super(props);
        this.state = {
            possibleGames: [],
        };
    }

    addPlayer = async (gameId: string, player: string | null) => {
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
        send(JSON.stringify({'gameId': gameId, 'messageType': websocket.register, 'player': player}));
    };

    getAllGames = async () => {
        const allGames = await this.context.getAllGames();
        this.setState({possibleGames: allGames});
    };

    joinGame = async (player: string | null, gameId: string) => {
        await this.getAllGames();
        if (this.state.possibleGames.some(game => game.id === gameId)) {
            await this.addPlayer(gameId, player);
        } else {
            await this.context.addGame(gameId);
            await this.addPlayer(gameId, player);
        }
    };

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path={getDomRoutes().login} render={(props) => (
                        <Login {...props} />
                    )}/>
                    <Route exact path={getDomRoutes().signup} render={(props) => (
                        <Signup {...props} />
                    )}/>
                    <Route exact path={getDomRoutes().suggestWord} render={(props) => (
                        <SuggestWord {...props} />
                    )}/>
                    <Route path={getDomRoutes().leaderboard} render={(props) => (
                        <Leaderboard {...props} />
                    )}/>
                    <Route path={getDomRoutes(':gameId').game} render={(props) => (
                        <Game {...props} />
                    )}/>
                    <Route path={getDomRoutes(':gameId').gameOver} render={(props) => (
                        <GameOver {...props} />
                    )}/>
                    <Route path={getDomRoutes(':gameId').startGame} render={(props) => (
                        <StartGame {...props} />
                    )}/>
                    <Route exact path={getDomRoutes().main} render={(props) => (
                        <Main {...props} joinGame={this.joinGame}/>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
