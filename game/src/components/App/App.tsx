import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
//components
import Login from '../Login/Login';
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

class App extends Component<{}, {}> {
    static contextType = ApiContext;

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path={getDomRoutes().suggestWord} render={(props) => (
                        <SuggestWord {...props} />
                    )}/>
                    <Route path={getDomRoutes().leaderboard} component={Leaderboard}/>
                    <Route path={getDomRoutes(':gameId').game} render={(props) => (
                        <Game {...props}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').gameOver} render={(props) => (
                        <GameOver {...props}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').startGame} render={(props) => (
                        <StartGame {...props}/>
                    )}/>
                    <Route exact path={getDomRoutes().login} render={(props) => (
                        <Login {...props}/>
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
