import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
//components
import Main from '../Main/Main';
import Login from "../Login/login";
import StartGame from "../StartGame/StartGame";
import Game from "../Game/Game";
import GameOver from "../GameOver/GameOver";
import Leaderboard from "../Leaderboard/Leaderboard";
import SuggestWord from "../SuggestWord/SuggestWord";
import {ApiContext} from '../Api/ApiProvider';
//utils
import getRoutes from '../../utils/routes';
import getDomRoutes from "../../utils/domRoutes";
import websocket from "../../utils/websocket";
//styles
import './App.css';
import Signup from "../Signup/signup";

let ws: any;

interface GameType {
    id: string;
    players: string[];
}

interface AppState {
    possibleGames: GameType[];
    isAuthorized: boolean;
}

class App extends Component<{}, AppState> {
    static contextType = ApiContext;
    constructor(props: {}) {
        super(props);
        this.state = {
            possibleGames: [],
            isAuthorized: false,
        }
    }

    async componentDidMount() {
        //await this.getAllGames();
        const userLoginData = await this.context.getUserLoginData();
        if (userLoginData.loggedIn) {
            this.setState({isAuthorized: true});
        }
    }
    setAuthorized = () => {
        this.setState({isAuthorized: true});
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
        send(JSON.stringify({'gameId':gameId,'messageType':websocket.register, 'player':player}));
    }

    getAllGames = async () => {
        const allGames = await this.context.getAllGames();
        this.setState({possibleGames: allGames});
    }

    joinGame = async (player: string | null, gameId: string) => {
        await this.getAllGames();
        if (this.state.possibleGames.some(game => game.id === gameId)) {
            await this.addPlayer(gameId, player);
        } else {
            await this.context.addGame(gameId);
            await this.addPlayer(gameId, player);
        }
    }

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path={getDomRoutes().login} render={(props) => (
                        <Login {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route exact path={getDomRoutes().signup} render={(props) => (
                        <Signup {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route exact path={getDomRoutes().suggestWord} render={(props) => (
                        <SuggestWord {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route path={getDomRoutes().leaderboard} render={(props) => (
                        <Leaderboard {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').game} render={(props) => (
                        <Game {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').gameOver} render={(props) => (
                        <GameOver {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').startGame} render={(props) => (
                        <StartGame {...props} setAuthorized={this.setAuthorized}/>
                    )}/>
                    <Route exact path={getDomRoutes().main} render={(props) => (
                        <Main {...props} joinGame={this.joinGame} isAuthorized={this.state.isAuthorized} setAuthorized={this.setAuthorized}/>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
