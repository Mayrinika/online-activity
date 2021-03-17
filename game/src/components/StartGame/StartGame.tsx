import React, {Component} from "react";
import Game from "../Game/Game";
import './StartGame.css';
import getRoutes from '../../utils/routes';

type startGameProps = {
    currentGameId: string;
    currentPlayer : string;
}

type startGameState = {
    areYouReady: boolean;
    players: string[];
}

class StartGame extends Component<startGameProps, startGameState> {
    constructor(props: startGameProps) {
        super(props);
        this.state= {
            areYouReady: false,
            players: []
        }
    }
    async componentDidMount() {
        await this.getCurrentGame();
    }
    getCurrentGame = async () => {
        const res = await fetch(getRoutes(this.props.currentGameId).gameId);
        const data = await res.text();
        console.log(data);
        const game = JSON.parse(data);
        this.setState({ players: game.players});
    }
    startGame = () => {
        this.setState({areYouReady: true});
    }
    render() {
        const gameComponent = <Game
            players={this.state.players}
            currentPlayer={this.props.currentPlayer}
            currentGameId = {this.props.currentGameId}
        />
        const startGame =
            <div className="StartGame">
                <h3>Игроки: {this.state.players.join(', ')}</h3>
                <h3>Все игроки в сборе?</h3>
                <button onClick={this.startGame}>Да! Начать игру!</button>
            </div>
        return (
            this.state.areYouReady ? gameComponent : startGame
        );
    }
}

export default StartGame;