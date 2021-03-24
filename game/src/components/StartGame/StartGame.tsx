import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
import {Route} from 'react-router-dom';
//components
import Game from "../Game/Game";
//utils
import getRoutes from '../../utils/routes';
//styles
import './StartGame.css';

interface startGameProps extends RouteComponentProps {
}

interface startGameState {
    players: string[];
    currentGameId: string | null;
    currentPlayer: string | null;
}

class StartGame extends Component<startGameProps, startGameState> {
    constructor(props: startGameProps) {
        super(props);
        this.state = {
            players: [],
            currentPlayer: null,
            currentGameId: null
        }
    }

    async componentDidMount() {
        this.setState({
            currentGameId: localStorage.getItem('id'),
            currentPlayer: localStorage.getItem('name')
        }, (async () => await this.getCurrentGame()));
    }

    getCurrentGame = async () => {
        const res = await fetch(getRoutes(this.state.currentGameId).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({players: game.players});
    }

    startGame = async () => {
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
        const {players} = this.state;
        return (
            <div className="StartGame">
                <h3>Игроки: {players && players.join(', ')}</h3>
                <h3>Все игроки в сборе?</h3>
                <button onClick={this.startGame}>Да! Начать игру!</button>
            </div>
        );
    }
}

export default StartGame;