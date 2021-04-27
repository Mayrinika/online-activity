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
import PossibleGames from "../PossibleGames/PossibleGames";
import {ApiContext} from '../Api/ApiProvider';
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import './App.css';
import UserProfile from "../UserProfile/UserProfile";

class App extends Component<{}, {}> {
    static contextType = ApiContext;

    render() {
        const {user} = this.context;
        const isAuthorized = user !== null;
        const redirectToMain = <Redirect to={getDomRoutes().main}/>;
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
                        isAuthorized ? <SuggestWord {...props} /> : redirectToMain
                    )}/>
                    <Route path={getDomRoutes().leaderboard} render={(props) => (
                        <Leaderboard {...props} />
                    )}/>
                    <Route path={getDomRoutes().possibleGames} render={(props) => (
                        isAuthorized ? <PossibleGames {...props} /> : redirectToMain
                    )}/>
                    <Route path={getDomRoutes(':gameId').game} render={(props) => (
                        isAuthorized ? <Game {...props} /> : redirectToMain
                    )}/>
                    <Route path={getDomRoutes(':gameId').gameOver} render={(props) => (
                        isAuthorized ? <GameOver {...props} /> : redirectToMain
                    )}/>
                    <Route exact path={getDomRoutes().userProfile} render={(props) => (
                        isAuthorized ? <UserProfile {...props} /> : <Redirect to={getDomRoutes().main}/>
                    )}/>
                    <Route path={getDomRoutes(':gameId').startGame} render={(props) => (
                        isAuthorized ? <StartGame {...props} /> : redirectToMain
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
