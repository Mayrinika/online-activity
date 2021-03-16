import React, {Component} from "react";
import Game from "./Game";
import './StartGame.css'

type startGameProps = {
    players: string[];
    currentPlayer : string;
}

type startGameState = {
    areYouReady: boolean;
}

class StartGame extends Component<startGameProps, startGameState> {
    constructor(props: startGameProps) {
        super(props);
        this.state= {
            areYouReady: false,
        }
    }
    startGame = () => {
        this.setState({areYouReady: true});
    }
    render() {
        const gameComponent = <Game players={this.props.players} currentPlayer={this.props.currentPlayer}/>
        const startGame =
            <div className="StartGame">
                <h3>Игроки: {this.props.players.join(', ')}</h3>
                <h3>Все игроки в сборе?</h3>
                <button onClick={this.startGame}>Да! Начать игру!</button>
            </div>
        return (
            this.state.areYouReady ? gameComponent : startGame
        );
    }
}

export default StartGame;