import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
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
//styles
import './App.css';

class App extends Component<{}, {}> {
    static contextType = ApiContext;

    render() {
        const {user} = this.context;
        const main = getDomRoutes().main;
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
                        user ? <SuggestWord {...props} /> : <Redirect to={main}/>
                    )}/>
                    <Route path={getDomRoutes().leaderboard} render={(props) => (
                        <Leaderboard {...props} />
                    )}/>
                    <Route path={getDomRoutes(':gameId').game} render={(props) => (
                        user ? <Game {...props} /> : <Redirect to={main}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').gameOver} render={(props) => (
                        user ? <GameOver {...props} /> : <Redirect to={main}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').startGame} render={(props) => (
                        user ? <StartGame {...props} /> : <Redirect to={main}/>
                    )}/>
                    <Route exact path={getDomRoutes().main} render={(props) => (
                        <Main {...props} />
                    )}/>
                </Switch>
            </div>
        );
    }
}

export default App;
