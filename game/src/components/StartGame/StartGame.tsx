import React, {Component} from "react";
import { RouteComponentProps } from 'react-router-dom';
import {Route} from 'react-router-dom';
//components
import Game from "../Game/Game";
//utils
import getRoutes from '../../utils/routes';
//styles
import './StartGame.css';

interface startGameProps extends RouteComponentProps{

}

interface startGameState {
    isAllReady: boolean;
    players: string[];
    currentGameId: string | null;
    currentPlayer: string | null;
}

class StartGame extends Component<startGameProps, startGameState> {
    constructor(props: startGameProps) {
        super(props);
        this.state = {
            isAllReady: false,
            players: [],
            currentPlayer: null,
            currentGameId: null
        }
    }

    async componentDidMount() {
        this.setState({currentGameId: localStorage.getItem('id')});
        this.setState({currentPlayer: localStorage.getItem('name')});
        await this.getCurrentGame();
    }

    getCurrentGame = async () => {
        const res = await fetch(getRoutes(localStorage.getItem('id')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({players: game.players});
    }

    startGame = async () => {
        this.setState({isAllReady: true});
        await this.addWordAndPainter(this.state.currentGameId);
        this.props.history.push(`/${localStorage.getItem('id')}/game`);
    }

    addWordAndPainter = async (gameId: string | null) => {
        await fetch(getRoutes(gameId).addWordAndPainter, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({})
        });
    }

    render() {
        const gameComponent = <Game
            currentPlayer={this.state.currentPlayer}
            currentGameId={this.state.currentGameId}
        />
        const startGame =
            <div className="StartGame">
                <h3>Игроки: {this.state.players && this.state.players.join(', ')}</h3>
                <h3>Все игроки в сборе?</h3>
                <button onClick={this.startGame}>Да! Начать игру!</button>
            </div>
        return (
            this.state.isAllReady ? gameComponent : startGame
        );
    }
}

export default StartGame;